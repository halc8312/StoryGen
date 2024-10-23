import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { CharacterProvider, useCharacter } from './contexts/CharacterContext';
import CharacterGenerator from './components/CharacterGenerator';

const genres = ['ファンタジー', 'サイエンスフィクション', 'ホラー', 'ロマンス', '冒険', 'ミステリー', 'コメディ', 'ドラマ'];
const lengths = ['短編', '中編', '長編'];
const structures = ['導入', '展開', '結末', 'クライマックス', '解決', 'エピローグ', '伏線', '転換', 'フラッシュバック'];
const templates = [
  { theme: '冒険', setting: '宇宙' },
  { theme: '恋愛', setting: '中世の城' },
  { theme: 'ミステリー', setting: '未来都市' },
  { theme: 'ファンタジー', setting: '魔法の森' },
  { theme: 'サイエンスフィクション', setting: '異星人の侵略' },
  { theme: 'ホラー', setting: '廃墟の館' },
  { theme: 'ロマンス', setting: 'ビーチリゾート' },
  { theme: 'スポーツ', setting: '大会の勝利' },
  { theme: '歴史', setting: '戦国時代' },
  { theme: 'コメディ', setting: '学校のドタバタ' },
  { theme: 'サスペンス', setting: '失踪事件' },
  { theme: 'ドラマ', setting: '家族の絆' },
  { theme: 'ファンタジー', setting: '竜との戦い' },
  { theme: 'サイエンスフィクション', setting: 'タイムトラベル' },
  { theme: '冒険', setting: '宝探し' },
  { theme: '恋愛', setting: '友情から恋へ' },
];

const styles = ['アクション重視', '感情重視', 'ユーモア重視', 'サスペンス重視', 'ドラマ重視', '教訓的な内容'];
const themesForContinuation = [
  'サプライズ展開',
  'キャラクターの成長',
  '新しいキャラクターの登場',
  '過去の秘密の暴露',
  '友情の試練',
  '恋愛の進展'
];
const perspectives = ['第一人称視点', '第三人称視点', '複数視点', '神の視点'];
const characterActions = [
  '新しい冒険に出る',
  '過去を振り返る',
  '敵と対峙する',
  '新しい仲間を見つける',
  '大きな決断を下す',
  '意外な真実を発見する'
];

function AppContent() {
  const { characters } = useCharacter();
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyEntered, setIsApiKeyEntered] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);
  const [selectedLength, setSelectedLength] = useState(lengths[0]);
  const [selectedStructure, setSelectedStructure] = useState(structures[0]);
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [selectedTheme, setSelectedTheme] = useState(themesForContinuation[0]);
  const [selectedPerspective, setSelectedPerspective] = useState(perspectives[0]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [selectedCharacterAction, setSelectedCharacterAction] = useState(characterActions[0]);
  const [theme, setTheme] = useState('');
  const [setting, setSetting] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim() !== '') {
      setIsApiKeyEntered(true);
    } else {
      alert('APIキーを入力してください。');
    }
  };

  const generateStory = async () => {
    if (!apiKey) {
      alert('APIキーが設定されていません。');
      return;
    }

    setIsLoading(true);
    setStory('');
    try {
      const lengthPrompt = selectedLength === '短編' ? '短い物語' : selectedLength === '中編' ? '中くらいの物語' : '長い物語';
      const structurePrompt = `この物語は${selectedStructure}です。`;
      const characterPrompt = selectedCharacters.length > 0
        ? `主要キャラクター: ${selectedCharacters.map(c => c.name).join(', ')}\n${selectedCharacters.map(c => `${c.name}: ${c.details}`).join('\n')}`
        : '';
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `あなたは${selectedGenre}の物語作家です。与えられたテーマと設定に基づいて、${lengthPrompt}を生成してください。${structurePrompt}${characterPrompt}`
            },
            {
              role: "user",
              content: `テーマ: ${theme}\n設定: ${setting}\n以上の条件で物語を生成してください。`
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
      setStory(response.data.choices[0].message.content.trim() + '\n\nこの物語は続きます。');
    } catch (error) {
      console.error('物語の生成中にエラーが発生しました:', error);
      setStory('物語の生成中にエラーが発生しました。もう一度お試しください。');
    }
    setIsLoading(false);
  };

  const generateContinuation = async () => {
    if (!apiKey) {
      alert('APIキーが設定されていません。');
      return;
    }

    setIsLoading(true);
    try {
      const continuationPrompt = `続きのスタイルは${selectedStyle}で、テーマは${selectedTheme}、視点は${selectedPerspective}です。物語の構造は${selectedStructure}です。${selectedCharacters.map(c => `${c.name}が${selectedCharacterAction}`).join(', ')}。`;
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `あなたは物語作家です。以下の物語の続きを生成してください。${continuationPrompt}`
            },
            {
              role: "user",
              content: story
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
      setStory((prevStory) => prevStory + '\n\n' + response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('物語の続き生成中にエラーが発生しました:', error);
      setStory('物語の続き生成中にエラーが発生しました。もう一度お試しください。');
    }
    setIsLoading(false);
  };

  const saveStory = () => {
    const blob = new Blob([story], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'story.txt';
    link.click();
  };

  const handleTemplateSelect = (template) => {
    setTheme(template.theme);
    setSetting(template.setting);
    setSelectedTemplate(template);
  };

  const toggleCharacterSelection = (character) => {
    setSelectedCharacters(prevSelected => {
      if (prevSelected.includes(character)) {
        return prevSelected.filter(c => c !== character);
      } else {
        return [...prevSelected, character];
      }
    });
  };

  return (
    <div className="App">
      <h1>AI物語ジェネレーター</h1>

      {!isApiKeyEntered ? (
        <form onSubmit={handleApiKeySubmit} className="api-key-form">
          <div className="form-group">
            <label htmlFor="apiKey">OpenAI APIキーを入力してください：</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
              required
            />
          </div>
          <button type="submit">APIキーを設定</button>
        </form>
      ) : (
        <>
          <CharacterGenerator />
          <div className="character-list">
            <h2>生成されたキャラクター</h2>
            {characters.map((character, index) => (
              <div key={index} className={`character-item ${selectedCharacters.includes(character) ? 'selected' : ''}`}>
                <h3>{character.name}</h3>
                <p>年齢: {character.age}</p>
                <p>性別: {character.gender}</p>
                <p>職業: {character.occupation}</p>
                <p>性格: {character.personality}</p>
                <p>背景: {character.background}</p>
                <p>詳細: {character.details}</p>
                <button onClick={() => toggleCharacterSelection(character)}>
                  {selectedCharacters.includes(character) ? 'キャラクターの選択を解除' : 'キャラクターを選択'}
                </button>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="genre">ジャンル：</label>
            <select id="genre" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="length">長さ：</label>
            <select id="length" value={selectedLength} onChange={(e) => setSelectedLength(e.target.value)}>
              {lengths.map((length) => (
                <option key={length} value={length}>{length}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="structure">物語の構造：</label>
            <select id="structure" value={selectedStructure} onChange={(e) => setSelectedStructure(e.target.value)}>
              {structures.map((structure) => (
                <option key={structure} value={structure}>{structure}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>テンプレート：</label>
            <div className="template-buttons">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className={selectedTemplate === template ? 'selected' : ''}
                >
                  {template.theme} - {template.setting}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generateStory} disabled={isLoading}>
            {isLoading ? '生成中...' : '物語を生成'}
          </button>
          {story && (
            <div className="story">
              <h2>生成された物語：</h2>
              <p>{story}</p>
              <button onClick={saveStory}>物語を保存</button>
              <h3>続きのオプションを選択してください：</h3>
              <div className="form-group">
                <label htmlFor="style">続きのスタイル：</label>
                <select id="style" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
                  {styles.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="continuationTheme">続きのテーマ：</label>
                <select id="continuationTheme" value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)}>
                  {themesForContinuation.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="perspective">続きの視点：</label>
                <select id="perspective" value={selectedPerspective} onChange={(e) => setSelectedPerspective(e.target.value)}>
                  {perspectives.map((perspective) => (
                    <option key={perspective} value={perspective}>{perspective}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="characterAction">キャラクターの行動：</label>
                <select id="characterAction" value={selectedCharacterAction} onChange={(e) => setSelectedCharacterAction(e.target.value)}>
                  {characterActions.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <button onClick={generateContinuation} disabled={isLoading}>
                {isLoading ? '生成中...' : '続きを生成'}
              </button>
              <div>
                <label htmlFor="feedback">フィードバック：</label>
                <input
                  type="text"
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="フィードバックを入力"
                />
                <button onClick={() => alert(`フィードバック: ${feedback}`)}>送信</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <CharacterProvider>
      <AppContent />
    </CharacterProvider>
  );
}

export default App;
