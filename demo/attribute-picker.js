/**
 * Utility class to pick labels in a panel
 * @copyright CEA-LIST/DIASI/SIALV/LVA (2019)
 * @author CEA-LIST/DIASI/SIALV/LVA <pixano@cea.fr>
 * @license CECILL-C
*/

import { LitElement, html, css, customElement, property} from 'lit-element';
import '@material/mwc-dialog';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';

const default_schema = {
  category: [
    {name: 'person', color: "#eca0a0"},
    {name: 'car', color: "#eca0a0" }
  ],
  default: 'car'
};

export class AttributePicker extends LitElement {

    static get styles() {
      return [
        css`
        :host {
          -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none; /* Safari */
             -khtml-user-select: none; /* Konqueror HTML */
               -moz-user-select: none; /* Old versions of Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none; /* Non-prefixed version, currently
                                          supported by Chrome, Opera and Firefox */
        }
        h3 {
          font-size: 14px;
          margin-left: 10px;
        }
        .category {
          height: 40px;
          display: flex;
          align-items: center;
          padding-left: 10px;
        }
        .category:hover {
          background-color: #ececec;
          cursor: pointer;
        }
        .selected {
          background-color: rgb(230, 230, 230);
        }
        span.step {
          background: red;
          border-radius: 0.8em;
         -moz-border-radius: 0.8em;
         -webkit-border-radius: 0.8em;
         color: #ffffff;
         display: inline-block;
         line-height: 1.6em;
         margin-right: 15px;
         text-align: center;
         width: 1.6em;
         margin-left: 10px;
        }
        .category > p {
          margin: 0;
          padding-left: 10px;
        }
        .shortcut {
          position: absolute;
          right: 0px;
          z-index: 1;
        }
        #shortcut-table {
          font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }

        #shortcut-table td, #shortcut-table th {
          border: 1px solid #ddd;
          padding: 8px;
        }

        #shortcut-table tr:nth-child(even){background-color: #f2f2f2;}

        #shortcut-table tr:hover {background-color: #ddd;}

        #shortcut-table th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: #4CAF50;
          color: white;
        }
        paper-dropdown-menu {
            margin: auto;
            width: 70%;
            display: flex;
        }
        mwc-formfield {
          margin: auto;
          width: 70%;
          display: flex;
        }
        `
      ]
    }

    static get properties () {
        return {
            showDetail: { type: Boolean },
            shortcuts: { type: Array },
            schema: { type: Object },
            value: { type: Object }
        }
    }

    get selectedCategory() {
      return this.schema.category.find((c) => c.name === this.value.category);
    }

    constructor() {
        super();
        this.shortcuts = [
            ['u', 'Switch to edition mode'],
            ['m', 'Switch to manual creation mode'],
            ['s', 'Switch to smart creation mode'],
            ['CTRL + [0-9]', 'Select category by index'],
            ['TAB', 'Navigate through objects'],
            ['SHIFT + Tab', 'Navigate through objects (inverse)'],
            ['SHIFT + Click', 'Multiple selection'],
        ];
        this.showDetail = false;
        this.mem = '';
        this.schema = default_schema;
        this.value = {category: default_schema.default };
        this.mem = '';
        window.addEventListener('keydown', (event) => {
          if (event.ctrlKey) {
            event.preventDefault();
          }
        });
        window.addEventListener('keyup', (event) => {
          const isNumber = event.code.replace('Digit', '').replace('Numpad', '')
          if (Number(isNumber) >= 0 && Number(isNumber) <= 9 && event.ctrlKey) {
              event.preventDefault();
              this.mem += isNumber;
              
          }
          if (event.key === 'Control' && this.mem !== '') {
            event.preventDefault();
            const c = this.schema.category[Number(this.mem)];
            if (c) {
              this.setCategory(c.name);
            }
            this.mem = '';
          }
        });
    }

    openShortcuts() {
        const d = this.shadowRoot.querySelector('mwc-dialog');
        d.open = true;
    }

    _getList() {
        try {
          return this.schema.category.map((c)=> c.name);
        } catch {
          return [];
        }
    }

    _colorFor(categoryName) {
      const category = this.schema.category.find((c) => c.name === categoryName);
      return category ? category.color || 'rgb(0,0,0)' : 'rgb(0,0,0)';
    }

    setCategory(newCategory) {
        this.value = {category: newCategory };
        this._notifyUpdate();
    }

    /**
     * Triggered when exterior/non-user-triggered
     * edition of edition label schema
     * @param {*} entity
     */
    setAttributes(entity) {
      if (entity) {
          this.value = {category: entity.category};
      } 
    }

    setAttributesIdx(idx) {
      this.value = {category: this.schema.category.find((c) => c.idx === idx).name};
    }

    reloadSchema(schema) {
        this.schema = schema;
        this.value = {category: schema.default };
    }

    _notifyUpdate() {
        this.dispatchEvent(new Event('update'));
    }

    get shortcutsDialog() {
        return html`
        <mwc-dialog>
            <h3>Shortcut list</h3>
            <div>
            <table id="shortcut-table">
              <tr>
                <th>Shortcut</th>
                <th>Description</th>
              </tr>
              ${
                  this.shortcuts.map(([k,v]) => {
                    return html`
                    <tr><td>${k}</td><td>${v}</td></tr>
                    `;
                  })
              }
            </table>
            </div>
            <mwc-button
                slot="secondaryAction"
                dialogAction="cancel">OK</mwc-button>
        </mwc-dialog>
        `
    }

    firstUpdated() {
      this.reloadSchema(this.schema);
    }

    get renderDetail() {
        return html`
        <div id="updateEditor" style="width: 100%;" ?hidden=${this.showDetail}>
            <h3><label>Selected label</label></h3>
            ${
                this.schema.category.map((category, idx) => {
                    return html`
                    <div class="category ${category.name === this.value.category ? 'selected': ''}" id=${category.name} @click=${() => this.setCategory(category.name)}>
                        <span class="step" .style="background: ${this._colorFor(category.name)}">${idx}</span><p>${category.name}</p>
                    </div>
                    `
                })
            }
        </div>`
    }

    get renderSimple() {
        return html`
        <div ?hidden=${!this.showDetail}>
            <h3><label>Label for creation</label></h3>
            ${
            this.schema.category.map((category, idx) => {
                return html`
                <div class="category ${category.name === this.value.category ? 'selected': ''}" id=${category.name} @click=${() => this.setCategory(category.name)}>
                    <span class="step" .style="background: ${this._colorFor(category.name)}">${idx}</span><p>${category.name}</p>
                </div>`
            })
            }
        </div>
        `;
    }

    /**
     * Render the element template.
     */
    render(){
        /**
         * `render` must return a lit-html `TemplateResult`.
         *
         * To create a `TemplateResult`, tag a JavaScript template literal
         * with the `html` helper function:
         */
        return html`
            ${this.shortcutsDialog}
            <mwc-icon-button class="shortcut" icon="keyboard" @click=${this.openShortcuts}></mwc-icon-button>
            ${this.renderDetail}
            ${this.renderSimple}
        `;
    }

}

customElements.define('attribute-picker', AttributePicker);
