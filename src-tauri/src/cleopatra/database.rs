use lazy_static::lazy_static;
use mysql::prelude::*;
use mysql::*;
use serde_json::json;
use serde_json::Value;
use std::result;
use std::str;
use std::sync::Arc;

use crate::cleopatra::utils::row_to_json;

struct DB {
    pool: Option<PooledConn>,
}

impl DB {
    pub fn new() -> DB {
        DB { pool: None }
    }

    pub async fn login(
        &mut self,
        host: &str,
        username: &str,
        password: &str,
        port: &str,
    ) -> result::Result<String, String> {
        let url: &str = &format!("mysql://{username}:{password}@{host}:{port}");

        let mut connection = || -> Result<()> {
            let pool = Pool::new(url)?;
            let conn = pool.get_conn()?;
            self.pool = Some(conn);

            return Ok(());
        };

        connection().map_err(|e| e.to_string())?;

        Ok("Connected to database".to_string())
    }

    pub async fn query(
        &mut self,
        query: &str,
        params: Vec<String>,
    ) -> result::Result<Vec<Value>, String> {
        let conn = match self.pool.as_mut() {
            Some(conn) => conn,
            None => return Err("Not connected to database".to_string()),
        };

        let query = query.with(params);

        let query_run = query.run(conn);

        let result: Vec<Value> = query_run
            .map_err(|e| e.to_string())?
            .map(|row_result| {
                let row = row_result;

                match row {
                    Ok(row) => row_to_json(row),
                    Err(e) => {
                        println!("Error: {}", e.to_string());
                        json!({})
                    }
                }
            })
            .collect();

        Ok(result)
    }

    pub async fn raw_query(&mut self, query: &str) -> result::Result<Vec<Value>, String> {
        let conn = match self.pool.as_mut() {
            Some(conn) => conn,
            None => return Err("Not connected to database".to_string()),
        };

        let result: Result<Vec<Row>> = conn.query(query);

        let result: Vec<Value> = result
            .map_err(|e| e.to_string())?
            .iter()
            .map(|row| {
                row_to_json(row.to_owned())
            })
            .collect();

        Ok(result)
    }
}

lazy_static! {
    static ref DB_INSTANCE: Arc<tokio::sync::Mutex<DB>> =
        Arc::new(tokio::sync::Mutex::new(DB::new()));
}

#[tauri::command]
pub async fn login(
    host: &str,
    username: &str,
    password: &str,
    port: &str,
) -> result::Result<String, String> {
    let db = DB_INSTANCE.clone();
    let mut db = db.lock().await;
    Box::new(&mut db)
        .as_mut()
        .login(host, username, password, port)
        .await
}

#[tauri::command]
pub async fn query(query: &str, params: Vec<String>) -> result::Result<Vec<Value>, String> {
    let db = DB_INSTANCE.clone();
    let mut db = db.lock().await;

    let rows = Box::new(&mut db).as_mut().query(query, params).await;

    rows.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn raw_query(query: &str) -> result::Result<Vec<Value>, String> {
    let db = DB_INSTANCE.clone();
    let mut db = db.lock().await;

    let rows = Box::new(&mut db).as_mut().raw_query(query).await;

    rows.map_err(|e| e.to_string())
}
