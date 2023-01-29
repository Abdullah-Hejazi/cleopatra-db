use mysql::*;
use mysql::prelude::*;
use std::result;
use std::sync::Arc;
use lazy_static::lazy_static;
use serde_json::Value;
use std::collections::HashMap;
use serde_json::json;
use std::str;

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

        let query_run = query.run(conn);

        let result: Vec<Value> = query_run.map_err(|e| e.to_string())?.map(|row_result| {
            let mut row_map = HashMap::new();
            let row = row_result.unwrap_or_else(|e| panic!("Error: {}", e));
            let columns = row.columns();

            for (i, column) in columns.iter().enumerate() {
                let row_option = row.get_opt::<mysql::Value, usize>(i);

                let row_result = row_option.unwrap_or(Ok(
                    "".into()
                ));

                let value = row_result.unwrap_or_else(|e| {
                    println!("{}", e.to_string());
                    "".into()
                });

                let converted_value: serde_json::Value = match value {
                    mysql::Value::NULL => {
                        json!("")
                    },

                    mysql::Value::Bytes(buffer) => {
                        let str = String::from_utf8(buffer).unwrap_or("".to_string());

                        json!(str)
                    },

                    mysql::Value::Int(int) => {
                        json!(int)
                    },

                    mysql::Value::Date(year, month, day, hour, minutes, seconds, _) => {
                        let str = format!("{}-{}-{} {}:{}:{}", year, month, day, hour, minutes, seconds);

                        json!(str)
                    },

                    mysql::Value::Double(double) => {
                        json!(double)
                    },

                    mysql::Value::Float(float) => {
                        json!(float)
                    },

                    mysql::Value::UInt(int) => {
                        json!(int)
                    },

                    mysql::Value::Time(_, _, hours, minutes, seconds, _) => {
                        let str = format!("{}:{}:{}", hours, minutes, seconds);

                        json!(str)
                    }
                };

                row_map.insert(column.name_str().to_string(), converted_value);
            }

            json!(row_map)
        }).collect();

        Ok(result)
    }

    pub async fn raw_query(&mut self, query: &str) -> result::Result<Vec<Value>, String> {
        let conn = match self.pool.as_mut() {
            Some(conn) => conn,
            None => return Err("Not connected to database".to_string()),
        };

        let result: Result<Vec<Row>> = conn.query(query);

        let result: Vec<Value> = result.map_err(|e| e.to_string())?.iter().map(|row| {
            let mut row_map = HashMap::new();
            let columns = row.columns();

            for (i, column) in columns.iter().enumerate() {
                let row_option = row.get_opt::<mysql::Value, usize>(i);

                let row_result = row_option.unwrap_or(Ok(
                    "".into()
                ));

                let value = row_result.unwrap_or_else(|e| {
                    println!("{}", e.to_string());
                    "".into()
                });

                let converted_value: serde_json::Value = match value {
                    mysql::Value::NULL => {
                        json!("")
                    },

                    mysql::Value::Bytes(buffer) => {
                        let str = String::from_utf8(buffer).unwrap_or("".to_string());

                        json!(str)
                    },

                    mysql::Value::Int(int) => {
                        json!(int)
                    },

                    mysql::Value::Date(year, month, day, hour, minutes, seconds, _) => {
                        let str = format!("{}-{}-{} {}:{}:{}", year, month, day, hour, minutes, seconds);

                        json!(str)
                    },

                    mysql::Value::Double(double) => {
                        json!(double)
                    },

                    mysql::Value::Float(float) => {
                        json!(float)
                    },

                    mysql::Value::UInt(int) => {
                        json!(int)
                    },

                    mysql::Value::Time(_, _, hours, minutes, seconds, _) => {
                        let str = format!("{}:{}:{}", hours, minutes, seconds);

                        json!(str)
                    }
                };

                row_map.insert(column.name_str().to_string(), converted_value);
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