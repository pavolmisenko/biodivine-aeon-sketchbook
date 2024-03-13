import { css, html, LitElement, type PropertyValues, type TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import style_less from './functions-editor.less?inline'
import { map } from 'lit/directives/map.js'
import './editor-tile/variable-tile'
import './editor-tile/function-tile'
import { ContentData, Essentiality, type IFunctionData, Monotonicity } from '../../util/data-interfaces'
import langTools from 'ace-builds/src-noconflict/ext-language_tools'
import { type Ace } from 'ace-builds'
import { getNextEssentiality, getNextMonotonicity } from '../../util/utilities'
import { dialog } from '@tauri-apps/api'

@customElement('functions-editor')
export class FunctionsEditor extends LitElement {
  static styles = css`${unsafeCSS(style_less)}`
  @property() contentData: ContentData = ContentData.create()
  @state() functions: IFunctionData[] = []
  index = 0

  constructor () {
    super()
    this.addEventListener('remove-function-definition', (e) => { void this.removeFunction(e) })
    this.addEventListener('rename-function-definition', this.renameFunction)
    this.addEventListener('add-function-variable', this.addFunctionVariable)
    this.addEventListener('toggle-function-variable-monotonicity', this.toggleFunctionVariableMonotonicity)
    this.addEventListener('toggle-function-variable-essentiality', this.toggleFunctionVariableEssentiality)
    this.addEventListener('remove-function-variable', (e) => { void this.removeFunctionVariable(e) })
  }

  connectedCallback (): void {
    super.connectedCallback()
    window.addEventListener('focus-function-field', this.focusedFunction.bind(this))
  }

  disconnectedCallback (): void {
    super.disconnectedCallback()
    window.removeEventListener('focus-function-field', this.focusedFunction.bind(this))
  }

  protected updated (_changedProperties: PropertyValues): void {
    super.updated(_changedProperties)
    langTools.setCompleters([{
      getCompletions: (_editor: Ace.Editor, _session: Ace.EditSession, _point: Ace.Point, _prefix: string, callback: Ace.CompleterCallback) => {
        callback(null, this.functions.map((func): Ace.Completion => ({
          value: func.id,
          meta: func.id,
          snippet: func.id + '()'
        })))
      }
    }])
  }

  private focusedFunction (event: Event): void {
    const variableId = (event as CustomEvent).detail.variableId
    const element = this.shadowRoot?.querySelector(`#${variableId}`)
    element?.dispatchEvent(new Event('focus-function-field'))
    element?.scrollIntoView()
  }

  private addFunction (): void {
    this.functions.push({
      id: 'func' + this.index,
      function: '',
      variables: []
    })
    this.index++
    this.functions = [...this.functions]
  }

  private async removeFunction (event: Event): Promise<void> {
    if (!await this.confirmDialog()) return
    const id = (event as CustomEvent).detail.id
    const index = this.functions.findIndex(fun => fun.id === id)
    if (index === -1) return
    const functions = [...this.functions]
    functions.splice(index, 1)
    this.functions = functions
  }

  private renameFunction (event: Event): void {
    const detail = (event as CustomEvent).detail
    const index = this.functions.findIndex(fun => fun.id === detail.oldId)
    if (index === -1) return
    const functions = [...this.functions]
    functions[index] = {
      ...functions[index],
      id: detail.newId
    }
    this.functions = functions
  }

  private addFunctionVariable (event: Event): void {
    const detail = (event as CustomEvent).detail
    const index = this.functions.findIndex(fun => fun.id === detail.id)
    if (index === -1) return
    const functions = [...this.functions]
    functions[index].variables.push({
      id: detail.index,
      source: detail.variable,
      target: functions[index].id,
      essential: Essentiality.UNKNOWN,
      monotonicity: Monotonicity.UNSPECIFIED
    })
    this.functions = functions
  }

  private toggleFunctionVariableMonotonicity (event: Event): void {
    const detail = (event as CustomEvent).detail
    const index = this.functions.findIndex(fun => fun.id === detail.id)
    if (index === -1) return
    const functions = [...this.functions]
    functions[index].variables[detail.index] = {
      ...functions[index].variables[detail.index],
      monotonicity: getNextMonotonicity(functions[index].variables[detail.index].monotonicity)
    }
    this.functions = functions
  }

  private toggleFunctionVariableEssentiality (event: Event): void {
    const detail = (event as CustomEvent).detail
    const index = this.functions.findIndex(fun => fun.id === detail.id)
    if (index === -1) return
    const functions = [...this.functions]
    functions[index].variables[detail.index] = {
      ...functions[index].variables[detail.index],
      essential: getNextEssentiality(functions[index].variables[detail.index].essential)
    }
    this.functions = functions
  }

  private async removeFunctionVariable (event: Event): Promise<void> {
    if (!await this.confirmDialog()) return
    const detail = (event as CustomEvent).detail
    const index = this.functions.findIndex(fun => fun.id === detail.id)
    if (index === -1) return
    const functions = [...this.functions]
    functions[index].variables.splice(detail.index, 1)
    this.functions = functions
  }

  private async confirmDialog (): Promise<boolean> {
    return await dialog.ask('Are you sure?', {
      type: 'warning',
      okLabel: 'Delete',
      cancelLabel: 'Keep',
      title: 'Delete'
    })
  }

  protected render (): TemplateResult {
    return html`
      <div class="function-list">
        <div class="section" id="functions">
          <h2 class="heading uk-text-center">Functions</h2>
          <div class="uk-text-center uk-margin-small-bottom">
            <button @click="${this.addFunction}" class="uk-button uk-button-small">add function</button>
          </div>
          <div class="uk-list uk-list-divider uk-text-center">
            ${map(this.functions, (_node, index) => html`
              <function-tile .index="${index}"
                             .functions="${this.functions}">
              </function-tile>
            `)}
          </div>
        </div>
        <div class="section" id="variables">
          <h2 class="heading uk-text-center">Variables</h2>
          <div class="uk-list uk-list-divider uk-text-center">
            ${map(this.contentData?.variables, (node, index) => html`
              <variable-tile id="${node.id}"
                             .index="${index}"
                             .variables="${this.contentData.variables}"
                             .regulations="${this.contentData.regulations.filter(edge => edge.target === node.id)}"
                             .functions="${this.functions}">
              </variable-tile>
            `)}
          </div>
        </div>
      </div>
    `
  }
}
