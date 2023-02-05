#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cleopatra;

use cleopatra::database;
use cleopatra::filesystem;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main");

            match main_window {
                Some(window) => {
                    window.maximize()?;

                    window.set_decorations(false)?;
                }
                None => {}
            }

            Ok(())
        })
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
