#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cleopatra;

use cleopatra::database;
use cleopatra::filesystem;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            database::login,
            database::query,
            database::raw_query,
            filesystem::append_file,
            filesystem::create_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
