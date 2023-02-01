use std::fs::OpenOptions;
use std::io::Write;

#[tauri::command]
pub fn append_file(path: &str, content: &str) -> Result<String, String> {
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open(path);

    match file {
        Ok(ref mut file) => {
            return file.write_all(content.as_bytes())
                .map(|_| "File appended successfully!".to_string())
                .map_err(|e| e.to_string());
        }
        Err(e) => {
            return Err(e.to_string());
        }
    }
}

#[tauri::command]
pub fn create_file(path: &str) -> Result<String, String> {
    let file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(path);

    match file {
        Ok(_) => {
            return Ok("File created successfully!".to_string());
        }
        Err(e) => {
            return Err(e.to_string());
        }
    }
}