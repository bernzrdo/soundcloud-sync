
export interface SoundcloudLikes {
    collection: {
        track?: {
            id: number
            title: string
            user: {
                avatar_url: string
                username: string
            }
            full_duration: number
            artwork_url: string | null
            permalink_url: string
            media: { transcodings: {
                url: string
                format: { protocol: string }
            }[] }
        }
    }[]
    next_href?: string
}

export interface SoundcloudTrack {
    artwork_url: string
    caption: string
    commentable: boolean
    comment_count: number
    created_at: string
    description: string
    downloadable: boolean
    download_count: number
    duration: number
    full_duration: number
    embeddable_by: string
    genre: string
    has_downloads_left: boolean
    id: number
    kind: string
    label_name: string
    last_modified: string
    license: string
    likes_count: number
    permalink: string
    permalink_url: string
    playback_count: number
    public: boolean
    publisher_metadata: PublisherMetadata
    purchase_title: any
    purchase_url: string
    release_date: string
    reposts_count: number
    secret_token: any
    sharing: string
    state: string
    streamable: boolean
    tag_list: string
    title: string
    uri: string
    urn: string
    user_id: number
    visuals: any
    waveform_url: string
    display_date: string
    media: Media
    station_urn: string
    station_permalink: string
    track_authorization: string
    monetization_model: string
    policy: string
    user: User
}

interface PublisherMetadata {
    id: number
    urn: string
    artist: string
    contains_music: boolean
    explicit: boolean
}

interface Media {
    transcodings: Transcoding[]
}

interface Transcoding {
    url: string
    preset: string
    duration: number
    snipped: boolean
    format: Format
    quality: string
    is_legacy_transcoding: boolean
}

interface Format {
    protocol: string
    mime_type: string
}

interface User {
    avatar_url: string
    first_name: string
    followers_count: number
    full_name: string
    id: number
    kind: string
    last_modified: string
    last_name: string
    permalink: string
    permalink_url: string
    uri: string
    urn: string
    username: string
    verified: boolean
    city: string
    country_code: string
    badges: Badges
    station_urn: string
    station_permalink: string
}

interface Badges {
    pro: boolean
    creator_mid_tier: boolean
    pro_unlimited: boolean
    verified: boolean
}