import React, { useState } from 'react';
import axios from 'axios';

function MusicUploader() {
  const [audioUrl, setAudioUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAudioUrl(res.data.url); // 응답에서 받은 파일 URL 설정
    } catch (err) {
      console.error('파일 업로드 실패:', err);
      alert('업로드 실패');
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {audioUrl && (
        <div>
          <p>재생:</p>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
}

export default MusicUploader;
