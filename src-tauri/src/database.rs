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

        //let parameters = params.into_iter().collect::<Vec<_>>();

        let statement = match conn.prep(query) {
            Ok(statement) => statement,
            Err(e) => return Err(e.to_string()),
        };

        let rows: Vec<Row> = match conn.exec(statement, params) {
            Ok(rows) => rows,
            Err(e) => return Err(e.to_string()),
        };

        let json_values: Vec<Value> = rows.into_iter().try_fold(Vec::new(), |mut json_values, row| {
            let mut row_map = HashMap::new();
            let columns = row.columns();
            for (index, column) in columns.iter().enumerate() {
                let val: String = match row.get_opt(index) {
                    Some(val) => val.unwrap_or("".to_string()),
                    None => return Err("Failed to get value from row".to_string()),
                };

                
                row_map.insert(column.name_str(), val);
            }
            json_values.push(json!(row_map));

            Ok::<Vec<serde_json::Value>, String>(json_values)
        })?;
        Ok(json_values)
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