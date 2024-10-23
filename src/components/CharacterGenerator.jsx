// CharacterGenerator.jsx
import React, { useState } from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import axios from 'axios';

const CharacterGenerator = ({ apiKey }) => { // apiKeyをプロップスとして受け取る
  const { addCharacter } = useCharacter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [personality, setPersonality] = useState('');
  const [background, setBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // エラーステートの追加

  const personalityTraits = [
    '勇敢', '臆病', '賢明', '無知', '親切', '冷酷', '楽観的', '悲観的',
    '誠実', '不誠実', '忠実', '裏切り者', '冒険好き', '慎重', '創造的', '保守的'
  ];

  const generateCharacter = async () => {
    if (!apiKey) {
      alert('APIキーが設定されていません。');
      return;
    }

    setIsLoading(true);
    setError(''); // エラーメッセージのリセット
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini", // モデル名の修正
          messages: [
            {
              role: "system",
              content: "あなたは創造的なキャラクター設定の専門家です。与えられた情報を基に、詳細なキャラクター設定を生成してください。"
            },
            {
              role: "user",
              content: `名前: ${name}\n年齢: ${age}\n性別: ${gender}\n職業: ${occupation}\n性格: ${personality}\n背景: ${background}\n\nこの情報を基に、詳細なキャラクター設定を生成してください。キャラクターの特徴、動機、目標、人間関係、特殊能力（もしあれば）などを含めてください。`
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`, // プロップスから取得したapiKeyを使用
          },
        }
      );

      const generatedCharacter = {
        name,
        age,
        gender,
        occupation,
        personality,
        background,
        details: response.data.choices[0].message.content.trim()
      };

      addCharacter(generatedCharacter);
      // フォームをリセット
      setName('');
      setAge('');
      setGender('');
      setOccupation('');
      setPersonality('');
      setBackground('');
    } catch (error) {
      console.error('キャラクター生成中にエラーが発生しました:', error);
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        setError(`エラー: ${error.response.data.error.message}`);
      } else {
        setError('キャラクターの生成中にエラーが発生しました。もう一度お試しください。');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="character-generator">
      <h2>キャラクター生成</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前"
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="年齢"
      />
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="">性別を選択</option>
        <option value="男性">男性</option>
        <option value="女性">女性</option>
        <option value="その他">その他</option>
      </select>
      <input
        type="text"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
        placeholder="職業"
      />
      <select
        value={personality}
        onChange={(e) => setPersonality(e.target.value)}
      >
        <option value="">性格を選択</option>
        {personalityTraits.map(trait => (
          <option key={trait} value={trait}>{trait}</option>
        ))}
      </select>
      <textarea
        value={background}
        onChange={(e) => setBackground(e.target.value)}
        placeholder="背景（任意）"
      />
      <button onClick={generateCharacter} disabled={isLoading}>
        {isLoading ? 'キャラクター生成中...' : 'キャラクターを生成'}
      </button>
      {error && <p className="error-message">{error}</p>} {/* エラーメッセージの表示 */}
    </div>
  );
};

export default CharacterGenerator;
