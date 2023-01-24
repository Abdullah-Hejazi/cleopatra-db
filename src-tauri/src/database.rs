use mysql::*;
use serde::{Serialize, Deserialize};
use mysql::prelude::Queryable;

static mut DB : Option<PooledConn> = None;

#[derive(Serialize, Deserialize)]
pub struct DBResult {
    success: bool,
    message: String
}

#[tauri::command]
pub fn login(host: &str, username: &str, password: &str, port: &str) -> DBResult {
    let url: &str = &format!("mysql://{username}:{password}@{host}:{port}");

    let connection = || -> Result<()> {
        let pool = Pool::new(url)?;
        unsafe {
            let conn = pool.get_conn()?;
            DB = Some(conn);

            return Ok(());
        }
    };

    if let Err(e) = connection() {
        return DBResult {
            success: false,
            message: e.to_string()
        };
    }

    return DBResult {
        success: true,
        message: "Successfully connected to database".to_string()
    };
}

// #[tauri::command]
// pub fn query(query: &str) {
//     unsafe {
//         match &DB {
//             Some(conn) => {
//                 let result = *conn.query_drop(query);
//                 println!("{:?}", result);
//             },
//             None => {
//                 println!("No connection");
//             }
//         }
//     }
// }