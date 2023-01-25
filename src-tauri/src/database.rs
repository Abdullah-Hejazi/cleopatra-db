use mysql::*;
use std::result;
use std::sync::{Arc, Mutex};
use lazy_static::lazy_static;
use std::future::Future;
use std::pin::Pin;

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
}

lazy_static! {
    static ref DB_INSTANCE: Arc<Mutex<DB>> = Arc::new(Mutex::new(DB::new()));
}

#[tauri::command]
pub async fn login(host: &str, username: &str, password: &str, port: &str) -> result::Result<String, String> {
    let db = DB_INSTANCE.clone();
    let mut db = db.lock().unwrap();
    let result = Box::new(&mut db).as_mut().login(host, username, password, port).await;

    result
}