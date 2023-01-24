module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                win: {
                    target: 'portable',
                    asar: true,
                    icon: 'icon.ico'
                },
                linux:{
                    target:[
                        "deb",
                    ],
                    category: "Development",

                    vendor: 'Abdullah Hejazi',
                    maintainer: 'Abdullah Hejazi',
                    synopsis: 'A database viewer for mysql',
                    description: 'A Database viewer for mysql that allows you to easily view, edit, and delete data from your database',
                }
              }
        }
    }
}