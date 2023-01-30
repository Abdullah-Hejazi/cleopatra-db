use mysql::Row;
use serde_json::json;
use std::collections::HashMap;

pub fn row_to_json(row: Row) -> serde_json::Value {
    let mut row_map = HashMap::new();
    let columns = row.columns();

    for (i, column) in columns.iter().enumerate() {
        let row_option = row.get_opt::<mysql::Value, usize>(i);

        let row_result = row_option.unwrap_or(Ok("".into()));

        let value = row_result.unwrap_or_else(|e| {
            println!("{}", e.to_string());
            "".into()
        });

        let converted_value: serde_json::Value = match value {
            mysql::Value::NULL => {
                json!("")
            }

            mysql::Value::Bytes(buffer) => {
                let str = String::from_utf8(buffer).unwrap_or("".to_string());

                json!(str)
            }

            mysql::Value::Int(int) => {
                json!(int)
            }

            mysql::Value::Date(year, month, day, hour, minutes, seconds, _) => {
                let str = format!(
                    "{}-{}-{} {}:{}:{}",
                    year, month, day, hour, minutes, seconds
                );

                json!(str)
            }

            mysql::Value::Double(double) => {
                json!(double)
            }

            mysql::Value::Float(float) => {
                json!(float)
            }

            mysql::Value::UInt(int) => {
                json!(int)
            }

            mysql::Value::Time(_, _, hours, minutes, seconds, _) => {
                let str = format!("{}:{}:{}", hours, minutes, seconds);

                json!(str)
            }
        };

        row_map.insert(column.name_str().to_string(), converted_value);
    }

    json!(row_map)
}
