
type Source = 'main' | 'getTracks' | 'ripTrack'

const GRAY = '\x1b[0;90m'
const RESET = '\x1b[0m'

const BOLD_COLORS = [
    '\x1b[1;91m',
    '\x1b[1;92m',
    '\x1b[1;93m',
    '\x1b[1;94m',
    '\x1b[1;95m',
    '\x1b[1;96m'
]

let colorMap = new Map<Source, string>()

export default function(from: Source, message: string){

    let color = colorMap.get(from)
    if(!color){
        color = BOLD_COLORS[colorMap.size % BOLD_COLORS.length]!
        colorMap.set(from, color)
    }

    console.log(`${GRAY}${date()}${RESET} ${color}${from}${RESET} ${message}`)

}

function date(){

    const now = new Date()

    const year = now.getFullYear().toString()
    const month = pad(now.getMonth() + 1)
    const day = pad(now.getDate())
    const hour = pad(now.getHours())
    const minute = pad(now.getMinutes())
    const second = pad(now.getSeconds())

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

function pad(n: number){
    return n.toString().padStart(2, '0')
}