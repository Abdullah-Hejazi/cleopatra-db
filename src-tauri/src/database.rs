use mysql::*;
use mysql::prelude::*;
use std::result;
use std::sync::Arc;
use lazy_static::lazy_static;
use serde_json::Value;
use std::collections::HashMap;
use serde_json::json;

struct DB {
    pool: Option<PooledConn>,
}

impl DB {
    pub fn new() -> DB {
        DB {
            pool: None,
        }
    }

    pub async fn login(&mut self, host: &str, username: &str, password: &str, port: &str) -> result::Result<String, String> {
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

    pub async fn query(&mut self, query: &str, params: Vec<String>) -> result::Result<Vec<Value>, String> {
        let conn = match self.pool.as_mut() {
            Some(conn) => conn,
            None => return Err("Not connected to database".to_string()),
        };

        let query = query.with(params);

        let y = query.run(conn);

        let result: Vec<Value> = y.map_err(|e| e.to_string())?.map(|row_result| {
            let mut row_map = HashMap::new();
            let row = row_result.unwrap_or_else(|e| panic!("Error: {}", e));
            let columns = row.columns();

            for (i, column) in columns.iter().enumerate() {
                let row_option = row.get_opt::<String, usize>(i);

                let row_result = row_option.unwrap_or(Ok("".to_string()));

                let value = row_result.unwrap_or("".to_string());

                row_map.insert(column.name_str().to_string(), json!(value));
            }

            json!(row_map)
        }).collect();

        Ok(result)
    }

}

lazy_static! {
    static ref DB_INSTANCE: Arc<tokio::sync::Mutex<DB>> = Arc::new(tokio::sync::Mutex::new(DB::new()));
}

#[tauri::command]
pub async fn login(host: &str, username: &str, password: &str, port: &str) -> result::Result<String, String> {
    let db = DB_INSTANCE.clone();
    let mut db = db.lock().await;
    Box::new(&mut db).as_mut().login(host, username, password, port).await
}

#[tauri::command]
pub async fn query(query: &str, params: Vec<String>) -> result::Result<Vec<Value>, String> {
    let db = DB_INSTANCE.clone();
    let mut db = db.lock().await;

    println!("Query: {}", query);
    println!("Params: {:?}", params);
    
    let rows = Box::new(&mut db).as_mut().query(query, params).await;

    rows.map_err(|e| e.to_string())
}
