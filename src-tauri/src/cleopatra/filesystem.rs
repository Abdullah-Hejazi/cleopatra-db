use std::fs::OpenOptions;
use std::io::Write;

#[tauri::command]
pub fn append_file(path: &str, content: &str) -> Result<String, String> {
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open(path)
        .expect("Unable to open file");

    file.write_all(content.as_bytes()).expect("Unable to write data");

    Ok("File appended successfully!".to_string())
}