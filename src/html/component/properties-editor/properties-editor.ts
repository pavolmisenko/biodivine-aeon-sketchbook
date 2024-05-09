import { css, html, LitElement, type PropertyValues, type TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import style_less from './properties-editor.less?inline'
import { map } from 'lit/directives/map.js'
import './abstract-property/abstract-property'
import './dynamic/dynamic-attractor-count/dynamic-attractor-count'
import './dynamic/dynamic-fixed-point/dynamic-fixed-point'
import './dynamic/dynamic-generic/dynamic-generic'
import './dynamic/dynamic-has-attractor/dynamic-has-attractor'
import './dynamic/dynamic-trajectory/dynamic-trajectory'
import './dynamic/dynamic-trap-space/dynamic-trap-space'
import './static/static-generic/static-generic'
import './static/static-input-essential/static-input-essential'
import './static/static-input-essential-condition/static-input-essential-condition'
import './static/static-input-monotonic/static-input-monotonic'
import './static/static-input-monotonic-condition/static-input-monotonic-condition'
import {
  ContentData,
  type DynamicProperty,
  DynamicPropertyType,
  type StaticProperty,
  StaticPropertyType
} from '../../util/data-interfaces'
import { when } from 'lit/directives/when.js'
import { computePosition, flip } from '@floating-ui/dom'
import UIkit from 'uikit'
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { aeonState } from '../../../aeon_events'

@customElement('properties-editor')
export default class PropertiesEditor extends LitElement {
  static styles = css`${unsafeCSS(style_less)}`
  @property() contentData: ContentData = ContentData.create()
  @query('#dynamic-property-menu') declare dynamicPropertyMenuElement: HTMLElement
  @query('#add-dynamic-property-button') declare addDynamicPropertyElement: HTMLElement
  @query('#static-property-menu') declare staticPropertyMenuElement: HTMLElement
  @query('#add-static-property-button') declare addStaticPropertyElement: HTMLElement
  @state() addDynamicMenuVisible = false
  @state() addStaticMenuVisible = false
  dynPropIndex = 0
  statPropIndex = 0

  addDynamicPropertyMenu: IAddPropertyItem[] = [
    {
      label: 'Trap space',
      action: () => { this.addDynamicProperty(DynamicPropertyType.TrapSpace) }
    }, {
      label: 'Fixed point',
      action: () => { this.addDynamicProperty(DynamicPropertyType.FixedPoint) }
    }, {
      label: 'Exists trajectory',
      action: () => { this.addDynamicProperty(DynamicPropertyType.ExistsTrajectory) }
    }, {
      label: 'Attractor count',
      action: () => { this.addDynamicProperty(DynamicPropertyType.AttractorCount) }
    }, {
      label: 'Has attractor',
      action: () => { this.addDynamicProperty(DynamicPropertyType.HasAttractor) }
    }, {
      label: 'Generic',
      action: () => { this.addDynamicProperty(DynamicPropertyType.Generic) }
    }
  ]

  addStaticPropertyMenu: IAddPropertyItem[] = [
    {
      label: 'Essential function input',
      action: () => { this.addStaticProperty(StaticPropertyType.FunctionInputEssentialWithCondition) }
    }, {
      label: 'Essential variable regulation',
      action: () => { this.addStaticProperty(StaticPropertyType.VariableRegulationEssentialWithCondition) }
    }, {
      label: 'Monotonic function input',
      action: () => { this.addStaticProperty(StaticPropertyType.FunctionInputMonotonicWithCondition) }
    }, {
      label: 'Monotonic variable regulation',
      action: () => { this.addStaticProperty(StaticPropertyType.VariableRegulationMonotonicWithCondition) }
    }, {
      label: 'Generic',
      action: () => { this.addStaticProperty(StaticPropertyType.Generic) }
    }
  ]

  constructor () {
    super()

    document.addEventListener('click', this.closeMenu.bind(this))

    // classical events
    aeonState.sketch.properties.dynamicCreated.addEventListener(this.#onDynamicCreated.bind(this))
    aeonState.sketch.properties.staticCreated.addEventListener(this.#onStaticCreated.bind(this))
    this.addEventListener('dynamic-property-removed', this.removeDynamicProperty)
    aeonState.sketch.properties.dynamicRemoved.addEventListener(this.#onDynamicRemoved.bind(this))
    this.addEventListener('static-property-removed', this.removeStaticProperty)
    aeonState.sketch.properties.staticRemoved.addEventListener(this.#onStaticRemoved.bind(this))
    this.addEventListener('dynamic-property-changed', this.changeDynamicProperty)
    aeonState.sketch.properties.dynamicContentChanged.addEventListener(this.#onDynamicChanged.bind(this))
    this.addEventListener('static-property-changed', this.changeStaticProperty)
    aeonState.sketch.properties.staticContentChanged.addEventListener(this.#onStaticChanged.bind(this))

    // refresh-event listeners
    aeonState.sketch.properties.staticPropsRefreshed.addEventListener(this.#onStaticRefreshed.bind(this))
    aeonState.sketch.properties.dynamicPropsRefreshed.addEventListener(this.#onDynamicRefreshed.bind(this))

    // refreshing content from backend - placeholders
    aeonState.sketch.properties.refreshDynamicProps()
    aeonState.sketch.properties.refreshStaticProps()
  }

  updateDynamicProperties (dynamicProperties: DynamicProperty[]): void {
    this.dispatchEvent(new CustomEvent('save-dynamic-properties', {
      detail: {
        dynamicProperties
      },
      bubbles: true,
      composed: true
    }))
  }

  updateStaticProperties (staticProperties: StaticProperty[]): void {
    this.dispatchEvent(new CustomEvent('save-static-properties', {
      detail: {
        staticProperties
      },
      bubbles: true,
      composed: true
    }))
  }

  #onDynamicRefreshed (refreshedDynamic: DynamicProperty[]): void {
    this.dynPropIndex = Math.max(refreshedDynamic.length, this.dynPropIndex)
    this.updateDynamicProperties(refreshedDynamic)
    console.log(refreshedDynamic)
  }

  #onStaticRefreshed (refreshedStatic: StaticProperty[]): void {
    this.statPropIndex = Math.max(refreshedStatic.length, this.dynPropIndex)
    this.updateStaticProperties(refreshedStatic)
    console.log(refreshedStatic)
  }

  protected firstUpdated (_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties)
    UIkit.sticky(this.shadowRoot?.querySelector('.header') as HTMLElement)
  }

  addDynamicProperty (type: DynamicPropertyType): void {
    const id = 'dynamic' + this.dynPropIndex++
    aeonState.sketch.properties.addDefaultDynamic(id, type)
  }

  #onDynamicCreated (newDynamic: DynamicProperty): void {
    this.contentData.dynamicProperties.push(newDynamic)
    this.dynPropIndex++
    this.updateDynamicProperties(this.contentData.dynamicProperties)
    console.log(newDynamic)
  }

  addStaticProperty (type: StaticPropertyType): void {
    const id = 'static' + this.statPropIndex++
    aeonState.sketch.properties.addDefaultStatic(id, type)
  }

  #onStaticCreated (newStatic: StaticProperty): void {
    this.contentData.staticProperties.push(newStatic)
    this.statPropIndex++
    this.updateStaticProperties(this.contentData.staticProperties)
    console.log(newStatic)
  }

  changeDynamicProperty (event: Event): void {
    const detail = (event as CustomEvent).detail
    aeonState.sketch.properties.setDynamicContent(detail.property.id, detail.property)
  }

  #onDynamicChanged (changedProp: DynamicProperty): void {
    const id = changedProp.id
    const index = this.contentData.dynamicProperties.findIndex(prop => prop.id === id)
    if (index === -1) return
    const properties = [...this.contentData.dynamicProperties]
    properties[index] = changedProp
    this.updateDynamicProperties(properties)
  }

  changeStaticProperty (event: Event): void {
    const detail = (event as CustomEvent).detail
    console.log('property changed', detail.property)
    aeonState.sketch.properties.setStaticContent(detail.property.id, detail.property)
  }

  #onStaticChanged (changedProp: StaticProperty): void {
    const id = changedProp.id
    const index = this.contentData.staticProperties.findIndex(prop => prop.id === id)
    if (index === -1) return
    const properties = [...this.contentData.staticProperties]
    properties[index] = changedProp
    this.updateStaticProperties(properties)
  }

  removeDynamicProperty (event: Event): void {
    const id = (event as CustomEvent).detail.id
    console.log('property removed', id)
    aeonState.sketch.properties.removeDynamic(id)
  }

  #onDynamicRemoved (removedProp: DynamicProperty): void {
    const id = removedProp.id
    const index = this.contentData.dynamicProperties.findIndex(prop => prop.id === id)
    if (index === -1) return
    const properties = [...this.contentData.dynamicProperties]
    properties.splice(index, 1)
    this.updateDynamicProperties(properties)
  }

  removeStaticProperty (event: Event): void {
    const id = (event as CustomEvent).detail.id
    console.log('property removed', id)
    aeonState.sketch.properties.removeStatic(id)
  }

  #onStaticRemoved (removedProp: StaticProperty): void {
    const id = removedProp.id
    const index = this.contentData.staticProperties.findIndex(prop => prop.id === id)
    if (index === -1) return
    const properties = [...this.contentData.staticProperties]
    properties.splice(index, 1)
    this.updateStaticProperties(properties)
  }

  async openAddDynamicPropertyMenu (): Promise<void> {
    this.addDynamicMenuVisible = true
    void computePosition(this.addDynamicPropertyElement, this.dynamicPropertyMenuElement,
      {
        middleware: [flip()],
        placement: 'bottom-end'
      })
      .then(({ x, y }) => {
        this.dynamicPropertyMenuElement.style.left = x + 'px'
        this.dynamicPropertyMenuElement.style.top = y + 'px'
      })
  }

  async openAddStaticPropertyMenu (): Promise<void> {
    this.addStaticMenuVisible = true
    void computePosition(this.addStaticPropertyElement, this.staticPropertyMenuElement,
      {
        middleware: [flip()],
        placement: 'bottom-end'
      })
      .then(({ x, y }) => {
        this.staticPropertyMenuElement.style.left = x + 'px'
        this.staticPropertyMenuElement.style.top = y + 'px'
      })
  }

  itemClick (action: () => void): void {
    this.addDynamicMenuVisible = false
    action()
  }

  closeMenu (event: Event): void {
    if (!(event.composedPath()[0] as HTMLElement).matches('.add-dynamic-property')) {
      this.addDynamicMenuVisible = false
    }
    if (!(event.composedPath()[0] as HTMLElement).matches('.add-static-property')) {
      this.addStaticMenuVisible = false
    }
  }

  render (): TemplateResult {
    return html`
      <div id="dynamic-property-menu" class="menu-content">
        ${when(this.addDynamicMenuVisible,
            () => html`
              <ul class="uk-nav">
                ${map(this.addDynamicPropertyMenu, (item) => html`
                  <li class="menu-item" @click="${() => {
                    this.itemClick(item.action)
                  }}">
                    <a>
                      ${item.label}
                    </a>
                  </li>
                `)}
              </ul>`)}
      </div>
      <div id="static-property-menu" class="menu-content">
        ${when(this.addStaticMenuVisible,
            () => html`
              <ul class="uk-nav">
                ${map(this.addStaticPropertyMenu, (item) => html`
                  <li class="menu-item" @click="${() => {
                    this.itemClick(item.action)
                  }}">
                    <a>
                      ${item.label}
                    </a>
                  </li>
                `)}
              </ul>`)}
      </div>
      <div class="container">
        <div class="property-list">
          <div class="section" id="functions">
            <div class="header">
              <div></div>
              <h2 class="heading">Static</h2>
              <button id="add-static-property-button" class="add-property add-static-property"
                      @click="${this.openAddStaticPropertyMenu}">
                Add ${icon(faAngleDown).node}
              </button>
            </div>
            <div class="section-list">
              ${map(this.contentData.staticProperties, (prop, index) => {
                switch (prop.variant) {
                  case StaticPropertyType.Generic:
                    return html`
                      <static-generic .index=${index}
                                      .property=${prop}>
                      </static-generic>`
                  case StaticPropertyType.FunctionInputEssential:
                    return html`
                      <static-input-essential .index=${index}
                                              .property=${prop}>
                      </static-input-essential>`
                  case StaticPropertyType.FunctionInputEssentialWithCondition:
                  case StaticPropertyType.VariableRegulationEssentialWithCondition:
                    return html`
                      <static-input-essential-condition .index=${index}
                                                        .contentData=${this.contentData}
                                                        .property=${prop}>
                      </static-input-essential-condition>`
                  case StaticPropertyType.FunctionInputMonotonic:
                    return html`
                      <static-input-monotonic .index=${index}
                                              .property=${prop}>
                      </static-input-monotonic>`
                  case StaticPropertyType.FunctionInputMonotonicWithCondition:
                  case StaticPropertyType.VariableRegulationMonotonicWithCondition:
                    return html`
                      <static-input-monotonic-condition .index=${index}
                                                        .contentData=${this.contentData}
                                                        .property=${prop}>
                      </static-input-monotonic-condition>`
                  default:
                    return ''
                }
              })}
            </div>
          </div>
          <div class="section" id="variables">
            <div class="header">
              <div></div>
              <h2 class="heading">Dynamic</h2>
              <button id="add-dynamic-property-button" class="add-property add-dynamic-property"
                      @click="${this.openAddDynamicPropertyMenu}">
                Add ${icon(faAngleDown).node}
              </button>
            </div>
            <div class="section-list">
              ${map(this.contentData.dynamicProperties, (prop, index) => {
                switch (prop.variant) {
                  case DynamicPropertyType.FixedPoint:
                    return html`
                      <dynamic-fixed-point .index=${index}
                                           .property=${prop}
                                           .observations=${this.contentData.observations}>
                      </dynamic-fixed-point>`
                  case DynamicPropertyType.TrapSpace:
                    return html`
                      <dynamic-trap-space .index=${index}
                                          .property=${prop}
                                          .observations=${this.contentData.observations}>
                      </dynamic-trap-space>`
                  case DynamicPropertyType.ExistsTrajectory:
                    return html`
                      <dynamic-trajectory .index=${index}
                                          .property=${prop}
                                          .observations=${this.contentData.observations}>
                      </dynamic-trajectory>`
                  case DynamicPropertyType.AttractorCount:
                    return html`
                      <dynamic-attractor-count .index=${index}
                                               .property=${prop}>
                      </dynamic-attractor-count>`
                  case DynamicPropertyType.HasAttractor:
                    return html`
                      <dynamic-has-attractor .index=${index}
                                             .property=${prop}
                                             .observations=${this.contentData.observations}>
                      </dynamic-has-attractor>`
                  case DynamicPropertyType.Generic:
                    return html`
                      <dynamic-generic .index=${index}
                                       .property=${prop}>
                      </dynamic-generic>`
                  default:
                    return ''
                }
              })}
            </div>
          </div>
        </div>
      </div>`
  }
}

interface IAddPropertyItem {
  label: string
  action: () => void
}
