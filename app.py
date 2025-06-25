from flask import Flask, request, send_file, jsonify
import yt_dlp
import os
import uuid

app = Flask(__name__)

@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    # Generate a unique filename
    filename = f"{uuid.uuid4()}.mp3"
    output_path = os.path.join('/tmp', filename)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Send the file and then delete it
    try:
        return send_file(output_path, as_attachment=True, download_name='audio.mp3')
    finally:
        if os.path.exists(output_path):
            os.remove(output_path)

@app.route('/')
def home():
    return 'YouTube to MP3 backend is running!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
