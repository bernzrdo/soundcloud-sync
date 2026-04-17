import { mkdir, readdir, rename } from 'fs/promises'
import log from './log.js'
import { getTracks, ripTrack } from './soundcloud/main.js'
import { join } from 'path'
import notify from './notify.js'

const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH!
const TRASH_PATH = join(DOWNLOAD_PATH, '.trash')

try{

    log('main', 'Hello!')

    // create dir for tracks and trash
    await mkdir(TRASH_PATH, { recursive: true })

    // find already downloaded IDs
    const downloadedTracks = new Map<number, string>()
    
    for(let filename of await readdir(DOWNLOAD_PATH)){
        if(filename == '.trash') continue

        const matches = filename.match(/【(\d+)】\.mp3$/)
        if(!matches || matches.length < 2) throw Error(`Failed to find ID in "${filename}"`)
        
        const id = parseInt(matches[1]!)
        if(isNaN(id)) throw new Error(`Failed to turn ID ${matches[1]} into number in "${filename}"`)

        downloadedTracks.set(id, filename)

    }

    // get tracks
    const tracks = await getTracks()

    // "remove" unliked tracks
    const toRemove = downloadedTracks
        .entries().toArray()
        .filter(([id])=>!tracks.some(t=>t.id == id))
        .map(([_, filename])=>filename)
    
    for(let filename of toRemove){
        log('main', `Removing "${filename}"...`)
        await rename(join(DOWNLOAD_PATH, filename), TRASH_PATH)
    }

    // add new tracks
    const toAdd = tracks
        .filter(({ id })=>!downloadedTracks.has(id))
    
    const start = performance.now()
    for(let [i, track] of toAdd.entries()){

        await ripTrack(DOWNLOAD_PATH, track)

        const trackCount = i + 1
        const progress = trackCount / toAdd.length
        const tracksLeft = toAdd.length - trackCount

        log('main', `${Math.floor(progress * 100)}% done / ${tracksLeft} track${tracksLeft != 1 ? 's' : ''} left (${eta(start, trackCount, toAdd.length)})`)
    }

}catch(e: unknown){
    if(e instanceof Error){
        notify(e.message, e.stack ?? '(No stack provided.)')
        console.error(e)
    }else{
        notify('An unknown error occurred!', 'Check the console for more info.')
        console.error(e)
    }
    
}

function eta(start: number, done: number, total: number){

    const elapsed = performance.now() - start
    const avgTime = elapsed / done
    const msLeft = avgTime * (total - done)

    // seconds
    let unit = 'second'
    let time = msLeft / 1e3
    if(time > 60){
        // minutes
        unit = 'minute'
        time /= 60
        if(time > 60){
            // hours
            unit = 'hour'
            time /= 60
            if(time > 24){
                // days
                unit = 'day'
                time /= 24
            }
        }
    }

    time = Math.round(time)
    return `${time} ${unit}${time != -1 ? 's' : ''}`
}