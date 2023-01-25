#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod database;

fn main() {
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![
			database::login,
			database::query
		])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
