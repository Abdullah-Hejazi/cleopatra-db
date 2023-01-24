use mysql::*;
use serde::{Serialize, Deserialize};
use std::result;
use std::sync::Mutex;
use tauri::State;
use mysql::prelude::Queryable;

static mut DB : Option<PooledConn> = None;

// struct DB (Mutex<PooledConn>);

#[derive(Serialize, Deserialize)]
pub struct DBResult {
    success: bool,
    message: String
}

#[tauri::command]
pub async fn login(host: &str, username: &str, password: &str, port: &str) -> result::Result<String, String> {
    let url: &str = &format!("mysql://{username}:{password}@{host}:{port}");

    let connection = || -> Result<()> {
        let pool = Pool::new(url)?;
        unsafe {
            let conn = pool.get_conn()?;
            DB = Some(conn);

            return Ok(());
        }
    };

    connection().map_err(|e| e.to_string())?;

    Ok("Connected to database".to_string())
}

// #[tauri::command]
// pub async fn query(query: &str) -> result::Result<String, String> {
//     unsafe {
//         match DB {
//             Some(conn) => {
//                 let mut connection = &conn;
//                 let result: Result<Vec<Row>> = (*connection).query(query);
//                 println!("{:?}", result);
//                 return Ok("Query executed".to_string());
//             },
//             None => {
//                 println!("No connection");
//                 return Err("No connection".to_string());
//             }
//         }
//     }
// }