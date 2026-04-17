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
    
    for(let [i, track] of toAdd.entries()){
        await ripTrack(DOWNLOAD_PATH, track)
        log('main', `${Math.floor((i + 1) / toAdd.length * 100)}% done`)
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