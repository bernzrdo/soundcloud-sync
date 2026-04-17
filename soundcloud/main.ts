import log from '../log.js'
import type { SoundcloudLikes, SoundcloudTrack } from './types.js'
import type { Track } from '../types.js'
import NodeID3 from 'node-id3'
import mimeTypes from 'mime-types'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const USER_ID = process.env.USER_ID!
const CLIENT_ID = process.env.CLIENT_ID!
const LIMIT = 20

export async function getTracks(): Promise<Track[]> {

    log('getTracks', `Starting...`)

    let tracks: Track[] = []
    let offset: string | null = '0'

    // -1 means we've reached the end
    while(offset != null){

        // get liked items
        const req = await fetch(`https://api-v2.soundcloud.com/users/${USER_ID}/likes?${new URLSearchParams({
            client_id: CLIENT_ID,
            limit: LIMIT.toString(),
            offset: offset.toString()
        })}`)
        if(!req.ok){
            console.log(CLIENT_ID, await req.text())
            throw new Error(`Status: ${req.status}! Probably needs a new Client ID`)
        }

        const data: SoundcloudLikes = await req.json()

        offset = getNextOffset(data.next_href)

        // parse tracks
        tracks.push(...data.collection
            .filter(like=>'track' in like)
            .map(({ track })=>({
                id: track!.id,
                title: track!.title,
                artist: track!.user.username,
            }))
        )

        log('getTracks', `Found ${tracks.length} tracks.`)

    }

    log('getTracks', 'Done!')

    return tracks
}

// get the skip value from the next_href url
function getNextOffset(nextHref?: string): string | null {

    // if there's no nextHref, we've reached the end
    if(!nextHref) return null

    const offset = new URL(nextHref).searchParams.get('offset')
    if(!offset) throw new Error(`Couldn\'t find 'offset' parameter in next_href (${nextHref})`)
    return offset
}

export async function ripTrack(path: string, { id, title, artist }: Track){
    
    log('ripTrack', `Ripping ${title} - ${artist} (${id})`)

    const authParam = new URLSearchParams({ client_id: CLIENT_ID }).toString()

    // get track
    log('ripTrack', 'Getting track info...')
    const req = await fetch(`https://api-v2.soundcloud.com/tracks/${id}?${authParam}`)
    if(!req.ok) throw new Error(`Status: ${req.status}! Probably needs a new Client ID`)
    const track: SoundcloudTrack = await req.json()

    // find progressive stream
    const dest = track.media.transcodings.find(t=>t.format.protocol == 'progressive')
    if(!dest) throw new Error(`No good transcoding found for track ${artist} - ${title} (${id})`)

    // rip track
    log('ripTrack', 'Downloading track...')
    const streamRes = await fetch(`${dest.url}?${authParam}`)
    const stream = await streamRes.json()
    const music = await fetch(stream.url)
    let buffer: Buffer = Buffer.from(await music.arrayBuffer())

    // add id3
    log('ripTrack', 'Adding metadata...')
    buffer = NodeID3.write({
        title,
        artist: artist.replaceAll(', ', ' / '),
        image: await grabArt(track.artwork_url ?? track.user.avatar_url)
    }, buffer)

    // save track
    log('ripTrack', 'Saving...')
    const filename = `${artist} - ${title} 【${id}】.mp3`.replace(/[\\\/:*?"<>|]/g, '')
    await writeFile(
        join(path, filename),
        buffer
    )

}

async function grabArt(url: string){

    const res = await fetch(url.replace(/-large.(.*)$/, '-t1080x1080.$1'))
    const arrayBuffer = await res.arrayBuffer()

    return {
        mime: mimeTypes.lookup(url) || 'image/jpeg',
        type: { id: 3 },
        description: '',
        imageBuffer: Buffer.from(arrayBuffer)
    }

}