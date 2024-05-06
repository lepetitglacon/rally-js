import fs from 'fs'

const file = fs.readFileSync('./src/assets/heightmap/heightmap.json')
const json = JSON.parse(file)


for (let i = 0; i < json.length; i++) {
    for (let j = 0; j < json[i].length; j++) {
        json[i][j] = Math.round(json[i][j] * 100) / 100
    }
}

fs.writeFileSync('./src/assets/heightmap/heightmap_min.json', JSON.stringify(json))