/**
 * @copyright CEA-LIST/DIASI/SIALV/LVA (2019)
 * @author CEA-LIST/DIASI/SIALV/LVA <pixano@cea.fr>
 * @license CECILL-C
*/

import { LitElement, html, css } from 'lit-element';
import 'material-design-icons/iconfont/material-icons.css'
import '@material/mwc-icon-button';
import 'typeface-roboto/index.css';

import '@pixano/graphics-2d/lib/pxn-smart-rectangle';
import '@pixano/core/lib/playback-control';
import '@material/mwc-linear-progress';
import '@material/mwc-snackbar';

import './attribute-picker';
import { ImageSequenceLoader } from './data-loader';

export const increase = html`<svg enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m16 7h-8c-0.6 0-1 0.4-1 1v8c0 0.6 0.4 1 1 1h8c0.6 0 1-0.4 1-1v-8c0-0.6-0.4-1-1-1zm0 9h-8v-8h8v8z"/><polygon points="5.2 6.7 6.8 5.2 3.9 2.3 6 0 0 0 0 6 2.3 3.9"/><polygon points="17.7 0 19.9 2.3 17 5.2 18.5 6.7 21.6 3.8 24 6 24 0"/><polygon points="18.8 17 17.2 18.5 20.1 21.6 18 24 24 24 24 17.7 21.7 19.9"/><polygon points="5.5 17 2.4 19.9 0 17.8 0 24 6.3 24 4.1 21.6 7 18.6"/></svg>`;
export const decrease = html`<svg enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M17,8c0-0.6-0.4-1-1-1H8C7.4,7,7,7.4,7,8v8c0,0.6,0.4,1,1,1h8c0.6,0,1-0.4,1-1V8z M16,16H8V8h8V16z"/><polygon points="0.8 7 7 7 7 0.7 4.6 2.8 1.6 0 0 1.5 2.9 4.6"/><polygon points="21.2 4.6 24 1.6 22.5 0 19.4 2.9 17 0.8 17 7 23.3 7"/><polygon points="23.2 17 17 17 17 23.3 19.4 21.2 22.4 24 24 22.5 21.1 19.4"/><polygon points="2.8 19.4 0 22.4 1.5 24 4.6 21.1 7 23.3 7 17 0.7 17"/></svg>`;



class StandaloneSmartRectangleApp extends (LitElement)  {
  
  static get properties() {
    return {
      mode: { type: String },
      selectedIds: { type: Array },
      maxFrameIdx: { type: Number },
    };
  }


  constructor() {
    super();
    this.selectedIds = [];
    this.loader = new ImageSequenceLoader();
    this.maxFrameIdx = 0;
    this.targetFrameIdx = 0;
    this.onSliderUpdate = this.onSliderChange.bind(this);
    this.mode = 'smart-create';
    const classList = ['person', 'bicycle', 'car', 'motorcycle',  'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 
                      'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 
                      'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 
                      'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 
                      'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 
                      'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 
                      'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'];

    const colors = ['red', 'blue', 'green', 'cyan', 'magenta', 'darkred', 'orange',
                    '#ff8091', '#0066ff', '#a7b300', '#b25965', '#80b3ff', '#d2d96c', 
                    '#66333a', '#0074d9', '#ffee00', '#8c0025', '#004b8c', '#8c8300', 
                    '#d93662', '#2d74b3', '#66611a', '#8c234d', '#6ca6d9', '#d9ad00', 
                    '#ff80b3', '#004466', '#ffaa00', '#660036', '#23698c', '#8c6923', 
                    '#d9368d', '#008fb3', '#d9b56c', '#b35989', '#40d9ff', '#665533', 
                    '#663355', '#1a5766', '#8c4b00', '#b3008f', '#00eeff', '#d98d36', 
                    '#660052', '#23858c', '#66421a', '#ff00ee', '#59b3ad', '#ff6600', 
                    '#ff80f6', '#40ffd9', '#ff8c40', '#83008c', '#2db398', '#ffb380', 
                    '#88468c', '#00ffaa', '#b27d59', '#b836d9', '#238c5b', '#664733', 
                    '#553366', '#00ff66', '#d96236', '#8800ff', '#6cd998', '#8c3f23', 
                    '#a66cd9', '#336647', '#d9896c', '#381a66', '#2db32d', '#ff9180', 
                    '#0e0066', '#2e661a', '#663a33', '#4f468c', '#66ff00', '#ff0000', 
                    '#0000b3'];

    const categories = classList.map((c, idx) => {
      return {name: c, color: colors[idx]};
    });

    this.label_schema = {
                          category: categories,
                          default: 'person'
                        }

    this.labels = [];
    this.mediaInfo = [
      {timestamp: 6, url:['../images/sequence/00045.jpg']},
      {timestamp: 7, url:['../images/sequence/00050.jpg']},
      {timestamp: 8, url:['../images/sequence/00055.jpg']},
      {timestamp: 9, url:['../images/sequence/00060.jpg']},
      {timestamp: 10, url:['../images/sequence/00065.jpg']},
      {timestamp: 11, url:['../images/sequence/00070.jpg']},
      {timestamp: 12, url:['../images/sequence/00075.jpg']},
      {timestamp: 13, url:['../images/sequence/00080.jpg']},
      {timestamp: 14, url:['../images/sequence/00085.jpg']},
      {timestamp: 15, url:['../images/sequence/00090.jpg']},
      {timestamp: 16, url:['../images/sequence/00095.jpg']},
      {timestamp: 17, url:['../images/sequence/00100.jpg']},
      {timestamp: 18, url:['../images/sequence/00105.jpg']},
      {timestamp: 19, url:['../images/sequence/00110.jpg']},
      {timestamp: 20, url:['../images/sequence/00115.jpg']},
      {timestamp: 21, url:['../images/sequence/00120.jpg']},
      {timestamp: 22, url:['../images/sequence/00125.jpg']},
      {timestamp: 23, url:['../images/sequence/00130.jpg']},
      {timestamp: 24, url:['../images/sequence/00135.jpg']},
      {timestamp: 25, url:['../images/sequence/00140.jpg']},
      {timestamp: 26, url:['../images/sequence/00145.jpg']},
      {timestamp: 27, url:['../images/sequence/00150.jpg']},
      {timestamp: 28, url:['../images/sequence/00155.jpg']},
      {timestamp: 29, url:['../images/sequence/00160.jpg']},
      {timestamp: 30, url:['../images/sequence/00165.jpg']},
      {timestamp: 31, url:['../images/sequence/00170.jpg']},
      {timestamp: 32, url:['../images/sequence/00175.jpg']},
      {timestamp: 33, url:['../images/sequence/00180.jpg']},
      {timestamp: 34, url:['../images/sequence/00185.jpg']},
      {timestamp: 35, url:['../images/sequence/00190.jpg']}
    ];
  }

  firstUpdated() {
    if (typeof this.element.resize === "function") { 
      // safe to use the function
      this.element.resize();
    }
    this.attributePicker.reloadSchema(this.label_schema);

    // set first image and start loading video
    this.element.image = this.mediaInfo ? this.mediaInfo[0].url[0] : '';
    this.loader.init(this.mediaInfo || []).then((length) => {
      this.maxFrameIdx = Math.max(length - 1, 0);
      this.loader.abortLoading().then(() => {
        this.loader.load(0).then(() => {
          this._resetPlayback();
        });
      })
    });

    this.updateDisplayOfSelectedProperties();

    window.addEventListener('keydown', (evt) => {
      switch(evt.key) {
        case 's': {
          this.mode = 'smart-create';
          break;
        }
        case 'u': {
          this.mode = 'update';
          break;
        }
        case 'm': {
          this.mode = 'create';
          break;
        }
      }
    })
  }

  updateDisplayOfSelectedProperties() {
    if (this.selectedIds.length) {
      const shape = this.labels.find((s) => this.selectedIds.includes(s.id));
      this.attributePicker.setAttributes({category: shape.category});
    }
  }

  _colorFor(cat) {
    return this.attributePicker._colorFor(cat);
  }

  _setPlaybackNext() {
    this.shadowRoot.querySelector('playback-control').setNext();
  }

  _resetPlayback() {
    this.shadowRoot.querySelector('playback-control').set(0);

  }

  refresh() {
    if (!this.element) {
      return;
    }
    const frame_labels = this.labels.filter((l) => l.timestamp === this.targetFrameIdx);
    this.element.shapes = frame_labels;
  }

  onSliderChange(evt) {
    this.targetFrameIdx = evt.detail;
    if (this.pendingLoad) {
      return Promise.resolve(null);
    }
    this.pendingLoad = true;
    return new Promise((resolve) => {
      return this.loader.peekFrame(this.targetFrameIdx).then((data) => {
        this.pendingLoad = false;
        this.element.imageElement = data;
        this.refresh();        
      });
    });
  }

  /**
   * Handle shape category changed
   */
  onAttributeChanged() {
    console.log('attr updated');
    const value =  this.attributePicker.value;
    this.selectedIds.forEach((id) => {
      const label = this.labels.find((l) => l.id === id);
      label.category = value.category;
      label.color = this._colorFor(label.category);
    });
  }

  /**
   * Handle shape selection
   * @param {*} evt 
   */
  onSelection(evt) {
    this.selectedIds = evt.detail;
    this.updateDisplayOfSelectedProperties();
  }

  /**
   * Handle shape creation
   * @param {*} evt 
   */
  onCreate(evt) {
    const newObject = evt.detail;
    newObject.timestamp = this.targetFrameIdx;
    if (!newObject.category) {
      newObject.category = this.attributePicker.value.category;
    } else {
      this.shadowRoot.getElementById('snack').labelText = newObject.category;
      this.shadowRoot.getElementById('snack').open();
    }
    newObject.color = this._colorFor(newObject.category);
    this.labels.push(newObject);
  }

  onDelete(evt) {
    const ids = evt.detail;
    ids.forEach((id) => {
      this.labels = this.labels.filter(ann => ann.id !== id);
    });
  }

  onModeChange() {
    if (this.element) {
      this.mode = this.element.mode;
    }
  }

  onReady() {
    this.shadowRoot.querySelector('mwc-linear-progress').style.display = 'none';
  }

  get element() {
    return this.shadowRoot.querySelector('[name="canvas"]');
  }

  get attributePicker() {
    return this.shadowRoot.querySelector('attribute-picker');
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          height: 100%;
          overflow: hidden;
          --leftPanelWidth: 55px;
          --headerHeight: 50px;
        }
        .main {
          height: 100%;
          position: relative;
          display:flex;
          flex-direction: column;
        }
        .logo {
          width: var(--leftPanelWidth);
          cursor: pointer;
          background: #333;
          display: flex;
          align-items: center;        
        }
        #logo-im {
          width: 60%;
          margin:auto;
        }
        .plugin-container {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 100%;
        }
        .drawer {
          background: #333;
          padding: 10px 0px 0px;
          margin: 0;
          flex-direction: column;
          display: flex;
          flex: 0 0 var(--leftPanelWidth);
        }
        .editor {
          position: relative;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 100px;
        }
        .properties-panel {
          flex: 0 0 300px;
          background: whitesmoke;
          overflow: auto;
        }      
        mwc-icon-button {
          color: #6d6d6d;
        }
        mwc-icon-button:hover {
          color: white;
        }
        mwc-icon-button[selected] {
          color: white;
        }
        [name="canvas"] {
          height: 100%;
        }
        `]
  }

  render() {
      return html`
        <div class="main">
          <div class="plugin-container">
            <div class="drawer">
              <div class="logo">
                <img id="logo-im" src="../images/pixano-mono-grad.svg" alt="Pixano"  
                                  @click=${() => window.location.href = "http://pixano.cea.fr/"}>
              </div>
              <mwc-icon-button ?selected=${this.mode === 'update'}
                                title="Edition (u)"
                                icon="navigation"
                                @click="${() => this.mode = 'update'}">
              </mwc-icon-button>
              <mwc-icon-button ?selected=${this.mode === 'create'}
                              icon="add_circle_outline"
                              title="Manual creation (m)"
                              @click="${() => this.mode = 'create'}">
              </mwc-icon-button>
              <mwc-icon-button icon="flare" ?selected=${this.mode === 'smart-create'}
                            @click="${() => this.mode = 'smart-create'}"
                            title="Smart creation (s)">
                            </mwc-icon-button>
              <mwc-icon-button @click="${() => this.element.roiUp()}"
                            title="Roi scale up (+)">${increase}
                            </mwc-icon-button>
              <mwc-icon-button @click="${() => this.element.roiDown()}"
                            title="Roi scale down (-)">${decrease}
                            </mwc-icon-button>
            </div>
            <div class="editor">
              <mwc-linear-progress indeterminate></mwc-linear-progress>
              <pxn-smart-rectangle name="canvas"
                                  mode=${this.mode}
                                  @ready=${this.onReady}
                                  @create=${this.onCreate.bind(this)}
                                  @delete=${this.onDelete}
                                  @mode=${this.onModeChange}
                                  @selection=${this.onSelection}></pxn-smart-rectangle>
              <playback-control @update=${this.onSliderUpdate} max=${this.maxFrameIdx}></playback-control>
            </div>
            <div class="properties-panel">
              <attribute-picker ?showDetail=${this.selectedIds.length === 0}
                                @update=${this.onAttributeChanged}></attribute-picker>
            </div>     
          </div>
        </div>
        <mwc-snackbar id="snack"></mwc-snackbar>
      `;
    }
}

customElements.define('standalone-smart-rectangle-app', StandaloneSmartRectangleApp);
