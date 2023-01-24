// import fs
import fs from 'fs'

class SqlFileService {
    import (file) {
        const fileData = fs.readFileSync(file, 'utf8');

        let data = this.parseFile(fileData)

        if (data) {
            return {
                success: true,
                data: data
            }
        }

        return {
            success: false
        }
    }

    export (file, content) {
        const fileData = fs.readFileSync(file, 'utf8');

        let data = this.parseFile(fileData)

        if (data) {
            return {
                success: true,
                data: data
            }
        }

        return {
            success: false
        }
    }

    parseFile(data) {
        data = this.removeComments(data).split(';');

        let queries = []
        
        data.forEach(query => {
            // remove empty lines and lines that only have newlines
            if (query.trim() !== '') {
                queries.push(query.trim())
            }
        })

        return queries
    }

    removeComments(data) {
        data = data.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');

        // remove lines starting with --
        data = data.replace(/^\s*--.*$/gm, '');

        return data
    }
}

export default SqlFileService