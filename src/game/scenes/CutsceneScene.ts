import Phaser from 'phaser';
import { Cutscene, CutsceneLine, getCutscene, getChapter } from '../../data/chapters';

interface CutsceneCallbacks {
  onComplete: () => void;
  onSkip?: () => void;
  onAutoPlay?: () => void;
}

export class CutsceneScene extends Phaser.Scene {
  private cutscene!: Cutscene;
  private lineIndex = 0;
  private speakerText!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private isAutoPlaying = false;
  private autoTimer?: Phaser.Time.TimerEvent;
  private callbacks?: CutsceneCallbacks;
  private speakerColor = '#8B2942';

  constructor() {
    super({ key: 'CutsceneScene' });
  }

  init(data: { cutsceneId: string; callbacks: CutsceneCallbacks }) {
    const cutscene = getCutscene(data.cutsceneId);
    if (!cutscene) {
      console.error('Cutscene not found:', data.cutsceneId);
      data.callbacks.onComplete();
      return;
    }
    this.cutscene = cutscene;
    this.callbacks = data.callbacks;
    this.lineIndex = 0;
    this.isAutoPlaying = false;
  }

  create() {
    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);

    // Speaker name plate
    const speakerBg = this.add.graphics();
    speakerBg.fillStyle(parseInt(this.speakerColor.slice(1), 16), 1);
    speakerBg.fillRoundedRect(80, 200, 300, 60, 8);

    this.speakerText = this.add.text(100, 215, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#FFF8F0',
      fontStyle: 'bold',
    });

    // Dialogue box
    const dialogueBg = this.add.graphics();
    dialogueBg.fillStyle(0x2D1B14, 0.95);
    dialogueBg.fillRoundedRect(60, 280, this.scale.width - 120, 200, 12);
    dialogueBg.lineStyle(3, parseInt(this.speakerColor.slice(1), 16));
    dialogueBg.strokeRoundedRect(60, 280, this.scale.width - 120, 200, 12);

    this.dialogueText = this.add.text(100, 300, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#FFF8F0',
      wordWrap: { width: this.scale.width - 200 },
      lineSpacing: 8,
    });

    // Continue indicator
    this.continueText = this.add.text(this.scale.width - 100, 460, '▼', {
      fontSize: '20px',
      color: '#C9A84C',
    });
    this.continueText.setOrigin(0.5);

    // Click to advance
    this.input.on('pointerdown', () => this.advance());

    this.showLine(0);
  }

  private showLine(index: number) {
    if (index >= this.cutscene.lines.length) {
      this.callbacks?.onComplete();
      this.scene.stop();
      return;
    }

    const line = this.cutscene.lines[index];

    // Speaker color based on character
    const speakerColors: Record<string, string> = {
      Emily: '#8B2942',
      Brad: '#4A5568',
      Claire: '#9F7AEA',
      Detective: '#2B6CB0',
    };
    this.speakerColor = speakerColors[line.speaker] || '#8B2942';

    this.speakerText.setText(line.speaker);
    this.dialogueText.setText('');

    // Typewriter effect
    this.typeText(line.text, () => {
      // Show continue indicator when done
      this.tweens.add({
        targets: this.continueText,
        alpha: 0.3,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    });

    if (this.isAutoPlaying) {
      this.autoTimer?.destroy();
      this.autoTimer = this.time.delayedCall(3000, () => this.advance());
    }
  }

  private typeText(text: string, onComplete: () => void) {
    let i = 0;
    const speed = 30; // ms per character
    this.dialogueText.setText('');

    const timer = this.time.addEvent({
      delay: speed,
      callback: () => {
        this.dialogueText.setText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          timer.destroy();
          onComplete();
        }
      },
      repeat: text.length - 1,
    });
  }

  private advance() {
    if (this.dialogueText.text.length < this.cutscene.lines[this.lineIndex].text.length) {
      // Skip typewriter - show full text
      this.dialogueText.setText(this.cutscene.lines[this.lineIndex].text);
      return;
    }

    this.lineIndex++;
    this.showLine(this.lineIndex);
  }

  setAutoPlay(enabled: boolean) {
    this.isAutoPlaying = enabled;
  }

  shutdown() {
    this.autoTimer?.destroy();
  }
}
