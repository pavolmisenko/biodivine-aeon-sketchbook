import { css, html, LitElement, type TemplateResult, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import style_less from './root-component.less?inline'
import '../content-pane/content-pane'
import '../nav-bar/nav-bar'
import { type TabData } from '../../util/tab-data'
import { aeonState, type LayoutNodeData, type RegulationData, type VariableData } from '../../../aeon_events'
import { tabList } from '../../util/config'
import {
  ContentData,
  type ILayoutData,
  type IRegulationData,
  type IVariableData,
  Monotonicity
} from '../../util/data-interfaces'
import { dialog } from '@tauri-apps/api'
import { dummyData } from '../../util/dummy-data'

const LAYOUT = 'default'

@customElement('root-component')
class RootComponent extends LitElement {
  static styles = css`${unsafeCSS(style_less)}`
  @state() data: ContentData = ContentData.create()
  @state() tabs: TabData[] = tabList

  constructor () {
    super()
    aeonState.tabBar.active.addEventListener(this.#onSwitched.bind(this))
    aeonState.tabBar.pinned.addEventListener(this.#onPinned.bind(this))
    aeonState.tabBar.active.refresh()
    aeonState.tabBar.pinned.refresh()
    this.addEventListener('load-dummy', () => { void this.loadDummy() })
    this.addEventListener('focus-function', this.focusFunction)
    this.addEventListener('add-variable', this.addVariable)
    aeonState.model.variableCreated.addEventListener(this.#onVariableCreated.bind(this))
    this.addEventListener('add-regulation', this.addRegulation)
    aeonState.model.regulationCreated.addEventListener(this.#onRegulationCreated.bind(this))
    this.addEventListener('set-variable-function', this.setVariableFunction)
    // TODO: detect if function changed on backend
    this.addEventListener('rename-variable', this.renameVariable)
    aeonState.model.variableNameChanged.addEventListener(this.#onVariableNameChanged.bind(this))
    this.addEventListener('change-node-position', this.changeNodePosition)
    aeonState.model.nodePositionChanged.addEventListener(this.#onNodePositionChanged.bind(this))
    this.addEventListener('set-variable-id', this.setVariableId)
    aeonState.model.variableIdChanged.addEventListener(this.#onVariableIdChanged.bind(this))
    this.addEventListener('set-regulation-observable', this.setRegulationObservable)
    aeonState.model.regulationObservableChanged.addEventListener(this.#onRegulationObservableChanged.bind(this))
    this.addEventListener('set-regulation-monotonicity', this.setRegulationMonotonicity)
    aeonState.model.regulationSignChanged.addEventListener(this.#onRegulationMonotonicityChanged.bind(this))
    this.addEventListener('remove-variable', (e) => {
      void this.removeVariable(e)
    })
    aeonState.model.variableRemoved.addEventListener(this.#onVariableRemoved.bind(this))
    this.addEventListener('remove-regulation', (e) => { void this.removeRegulation(e) })
    aeonState.model.regulationRemoved.addEventListener(this.#onRegulationRemoved.bind(this))
    aeonState.model.variablesRefreshed.addEventListener(this.#onVariablesRefreshed.bind(this))
    aeonState.model.layoutNodesRefreshed.addEventListener(this.#onLayoutNodesRefreshed.bind(this))
    aeonState.model.regulationsRefreshed.addEventListener(this.#onRegulationsRefreshed.bind(this))

    aeonState.model.refreshVariables()
    aeonState.model.refreshLayoutNodes(LAYOUT)
    aeonState.model.refreshRegulations()
  }

  #onPinned (pinned: number[]): void {
    this.tabs = this.tabs.map((tab) =>
      tab.copy({
        pinned: pinned.includes(tab.id)
      })
    )
    this.adjustRegEditor()
  }

  #onSwitched (tabId: number): void {
    this.tabs = this.tabs.map((tab) =>
      tab.copy({
        active: tab.id === tabId
      })
    )
    this.adjustRegEditor()
  }

  renameVariable (event: Event): void {
    const details = (event as CustomEvent).detail
    aeonState.model.setVariableName(details.id, details.name)
  }

  #onVariableNameChanged (data: VariableData): void {
    const variables = [...this.data.variables]
    const variableIndex = variables.findIndex(variable => variable.id === data.id)
    variables[variableIndex] = {
      ...variables[variableIndex],
      id: data.id,
      name: data.name
    }
    this.saveData(variables, this.data.regulations, this.data.layout)
  }

  private addVariable (event: Event): void {
    const details = (event as CustomEvent).detail
    const position = {
      layout: LAYOUT,
      px: details.position.x,
      py: details.position.y
    }
    aeonState.model.addVariable(details.id, details.name, position)
  }

  #onVariableCreated (data: VariableData): void {
    const variables = [...this.data.variables]
    variables.push({
      id: data.id,
      name: data.name,
      function: ''
    })
    this.saveData(variables, this.data.regulations, this.data.layout)
  }

  private addRegulation (event: Event): void {
    const details = (event as CustomEvent).detail
    // TODO: just a hotfix, needs to be changed once we unify the types
    let observable
    switch (details.observable) {
      case true:
        observable = 'True'
        break
      default:
        observable = 'False'
        break
    }
    aeonState.model.addRegulation(details.source, details.target, details.monotonicity, observable)
  }

  #onRegulationCreated (data: RegulationData): void {
    const regulations = [...this.data.regulations]

    // TODO: just a hotfix, needs to be changed once we unify the types

    regulations.push({
      id: data.regulator + data.target,
      source: data.regulator,
      target: data.target,
      observable: data.observable.toUpperCase() === 'TRUE',
      monotonicity: data.sign
    })
    this.saveData(this.data.variables, regulations, this.data.layout)
  }

  private async removeVariable (event: Event): Promise<void> {
    if (!await this.confirmDialog()) return
    const variableId = (event as CustomEvent).detail.id
    aeonState.model.removeVariable(variableId)
  }

  #onVariableRemoved (data: VariableData): void {
    this.saveData(
      this.data.variables.filter((variable) => variable.id !== data.id),
      this.data.regulations,
      this.data.layout
    )
  }

  private adjustRegEditor (): void {
    if (window.outerWidth <= 800) return
    window.dispatchEvent(new CustomEvent('adjust-graph', {
      detail: {
        tabCount: this.visibleTabs().length
      }
    }))
  }

  private focusFunction (event: Event): void {
    aeonState.tabBar.active.emitValue(1)
    window.dispatchEvent(new CustomEvent('focus-function-field', {
      detail: {
        variableId: (event as CustomEvent).detail.variableId
      }
    }))
  }

  private visibleTabs (): TabData[] {
    return this.tabs.sort((a, b) => a.id - b.id).filter((tab) => tab.pinned || tab.active)
  }

  private saveData (variables: IVariableData[], regulations: IRegulationData[], layout: ILayoutData): void {
    // sort nodes to keep alphabetical order in lists
    variables.sort((a, b) => (a.id > b.id ? 1 : -1))
    regulations.sort((a, b) => (a.source + a.target > b.source + b.target ? 1 : -1))

    this.data = ContentData.create({
      variables,
      regulations,
      layout
    })
  }

  private changeNodePosition (event: Event): void {
    const details = (event as CustomEvent).detail
    aeonState.model.changeNodePosition(LAYOUT, details.id, details.position.x, details.position.y)
  }

  #onNodePositionChanged (data: LayoutNodeData): void {
    // TODO: add support for layouts
    const layout = { ...this.data.layout }
    layout[data.variable] = {
      x: data.px,
      y: data.py
    }
    this.saveData(this.data.variables, this.data.regulations, layout)
  }

  private setVariableId (event: Event): void {
    const details = (event as CustomEvent).detail
    aeonState.model.setVariableId(details.oldId, details.newId)
  }

  // TODO: add interface for data
  #onVariableIdChanged (data: { original_id: string, new_id: string }): void {
    const variableIndex = this.data.variables.findIndex((variable) => variable.id === data.original_id)
    if (variableIndex === -1) return
    const variables = [...this.data.variables]
    variables[variableIndex] = {
      ...variables[variableIndex],
      id: data.new_id
    }
    this.saveData(variables, this.data.regulations, this.data.layout)
  }

  private setRegulationObservable (event: Event): void {
    const details = (event as CustomEvent).detail

    // TODO: just a hotfix, needs to be changed once we unify the types
    let observable
    switch (details.observable) {
      case true:
        observable = 'True'
        break
      default:
        observable = 'False'
        break
    }
    aeonState.model.setRegulationObservable(details.source, details.target, observable)
  }

  #onRegulationObservableChanged (data: RegulationData): void {
    const index = this.data.regulations.findIndex((reg) => reg.source === data.regulator && reg.target === data.target)
    if (index === -1) return
    const regulations = [...this.data.regulations]
    // TODO: just a hotfix, needs to be changed once we unify the types
    regulations[index] = {
      ...regulations[index],
      observable: data.observable.toUpperCase() === 'TRUE'
    }
    this.saveData(this.data.variables, regulations, this.data.layout)
  }

  private setRegulationMonotonicity (event: Event): void {
    const details = (event as CustomEvent).detail
    aeonState.model.setRegulationSign(details.source, details.target, details.monotonicity)
  }

  #onRegulationMonotonicityChanged (data: RegulationData): void {
    const index = this.data.regulations.findIndex((reg) => reg.source === data.regulator && reg.target === data.target)
    if (index === -1) return
    const regulations = [...this.data.regulations]
    regulations[index] = {
      ...regulations[index],
      monotonicity: this.parseMonotonicity(data.sign)
    }
    console.log(regulations[index])
    this.saveData(this.data.variables, regulations, this.data.layout)
  }

  private setVariableFunction (event: Event): void {
    const details = (event as CustomEvent).detail
    // TODO: send through backend
    const variableIndex = this.data.variables.findIndex(variable => variable.id === details.id)
    if (variableIndex === -1) return
    const variables = [...this.data.variables]
    variables[variableIndex] = {
      ...variables[variableIndex],
      function: details.function
    }
    this.saveData(variables, this.data.regulations, this.data.layout)
  }

  private async removeRegulation (event: Event): Promise<void> {
    if (!await this.confirmDialog()) return
    const details = (event as CustomEvent).detail
    aeonState.model.removeRegulation(details.source, details.target)
  }

  #onRegulationRemoved (data: RegulationData): void {
    this.saveData(
      this.data.variables,
      this.data.regulations.filter((regulation) => regulation.source !== data.regulator || regulation.target !== data.target),
      this.data.layout
    )
  }

  #onVariablesRefreshed (variables: VariableData[]): void {
    this.saveData(variables.map(v => { return { ...v, function: '' } }), this.data.regulations, this.data.layout)
  }

  #onLayoutNodesRefreshed (layoutNodes: LayoutNodeData[]): void {
    const layout: ILayoutData = {}
    layoutNodes.forEach(layoutNode => {
      layout[layoutNode.variable] = { x: layoutNode.px, y: layoutNode.py }
    })
    this.saveData(this.data.variables, this.data.regulations, layout)
  }

  #onRegulationsRefreshed (regulations: RegulationData[]): void {
    const regs = regulations.map((data): IRegulationData => {
      console.log(data.sign, this.parseMonotonicity(data.sign))
      return {
        id: data.regulator + data.target,
        source: data.regulator,
        target: data.target,
        observable: data.observable === 'True',
        monotonicity: this.parseMonotonicity(data.sign)
      }
    })
    this.saveData(this.data.variables, regs, this.data.layout)
  }

  async loadDummy (): Promise<void> {
    // TODO: remove sleep
    this.data.variables.forEach((variable) => {
      aeonState.model.removeVariable(variable.id)
    })
    await new Promise(_resolve => setTimeout(_resolve, 500))
    this.data.regulations.forEach((reg) => {
      aeonState.model.removeRegulation(reg.source, reg.target)
    })
    await new Promise(_resolve => setTimeout(_resolve, 500))
    dummyData.variables.forEach((variable) => {
      console.log(dummyData.layout, variable.id)
      aeonState.model.addVariable(variable.id, variable.name, {
        layout: LAYOUT,
        px: dummyData.layout[variable.id].x,
        py: dummyData.layout[variable.id].y
      })
    })
    await new Promise(_resolve => setTimeout(_resolve, 500))
    dummyData.regulations.forEach((regulation) => {
      aeonState.model.addRegulation(regulation.source, regulation.target, regulation.monotonicity, regulation.observable ? 'True' : 'False')
    })
  }

  private parseMonotonicity (monotonicity: string): Monotonicity {
    return Monotonicity[monotonicity.toUpperCase() as unknown as keyof typeof Monotonicity] ?? Monotonicity.UNSPECIFIED
  }

  private async confirmDialog (): Promise<boolean> {
    return await dialog.ask('Are you sure?', {
      type: 'warning',
      okLabel: 'Delete',
      cancelLabel: 'Keep',
      title: 'Delete'
    })
  }

  render (): TemplateResult {
    const visibleTabs = this.visibleTabs()
    return html`
      <div class="root-component">
        <nav-bar .tabs=${this.tabs}></nav-bar>
        <div class="content uk-flex uk-flex-row uk-flex-stretch uk-flex-wrap-stretch">
          ${map(this.tabs, (tab) => html`
            <content-pane id="${tab.name.toLowerCase()}" ?hidden="${!(tab.pinned || tab.active)}"
                          class="uk-width-1-${visibleTabs.length} ${tab.active ? 'active' : 'inactive'}" .tab=${tab}
                          .data=${this.data}></content-pane>
          `)}
        </div>
      </div>
    `
  }
}
