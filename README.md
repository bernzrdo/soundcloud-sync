# SoundCloud Sync

A Node.js utility to synchronize SoundCloud liked tracks to a local directory. It automatically downloads new likes, embeds high-resolution metadata, and moves unliked tracks to a local trash folder.

## Features

* **Bidirectional Sync**: Downloads new likes and moves tracks no longer present in your likes to a `.trash` sub-directory.
* **Metadata Tagging**: Automatically embeds Title, Artist, and Artwork using ID3v2.3.
* **High-Res Art**: Attempts to fetch `1080x1080` artwork by overriding default SoundCloud thumbnail URLs.
* **Deduplication**: Tracks local files using a unique ID suffix `【ID】.mp3` to prevent redundant downloads.

## Configuration

The script requires the following environment variables. Define these in your environment or a `.env` file:

| Variable | Description |
| :--- | :--- |
| `USER_ID` | Your SoundCloud numeric user ID. |
| `CLIENT_ID` | A valid SoundCloud API Client ID (captured from browser network traffic). |
| `DOWNLOAD_PATH` | The absolute path where music should be stored. |
| `CHANIFY_TOKEN` | Send error notifications via Chanify. |
