import { css, LitElement, type TemplateResult, html, unsafeCSS } from "lit";
import { map } from "lit/directives/map.js";
import { customElement, state } from "lit/decorators.js";
// Dummy and mock data
import { getDummyData, DataRecord } from "./dummy-data.js";
import { checkForIssues } from "./backend-mock.js";

// Include the content of regulations-import.less as raw string variable.
import style_less from "./regulations-import.less?inline";
import style_tab from "./tabulator-style.less?inline";
import { ColumnDefinition, Tabulator } from "tabulator-tables";
import { tabulatorOptions, loadTabulatorPlugins } from "./tabulator-utility.js";

@customElement("regulations-import")
export default class RegulationsImport extends LitElement {
  static styles = [
    css`
      ${unsafeCSS(style_less)}
    `,
    css`
      ${unsafeCSS(style_tab)}
    `,
  ];
  @state() data: DataRecord[] = [];
  @state() headers: string[] = [];
  @state() loaded = false;
  @state() sourceEntity: string | undefined = undefined;
  @state() targetEntity: string | undefined = undefined;

  table = document.createElement("div");

  tabulator: Tabulator | undefined;

  constructor() {
    super();
    loadTabulatorPlugins();
    this.table.id = "table-wrapper";
  }

  protected async firstUpdated(): Promise<void> {
    // Obtain data from the backend.
    // TODO: Implement this. Dummy data is used for now.
    const dummyData = await getDummyData();
    this.data = dummyData.data;
    this.headers = dummyData.headers;
    this.init();
  }

  createColumns(): ColumnDefinition[] {
    if (this.data.length === 0) {
      return [];
    }
    let columns: ColumnDefinition[] = [
      { title: "Issues", field: "_issues" },
      { title: "Source Entity", field: this.sourceEntity },
      { title: "Target Entity", field: this.targetEntity },
    ];
    this.headers.forEach((header) => {
      columns.push({ title: header, field: header, editable: true });
    });
    return columns;
  }

  changeSource(): void {
    this.sourceEntity = "column1";
    //triger rerender of part of the table
    this.tabulator?.setColumns(this.createColumns());
  }

  private async init(): Promise<void> {
    if (this.table !== undefined) {
      this.tabulator = new Tabulator(this.table, {
        columns: this.createColumns(),
        data: this.data,
        popupContainer: this.table,
        ...tabulatorOptions,
      });
      this.tabulator.on("tableBuilt", () => {
        this.loaded = true;
      });
    }
  }

  render(): TemplateResult {
    return html`${this.table}
      <div class="uk-margin">
        <label id="label-source-entity">Source Entity</label>
        <select id="select-source" class="uk-select">
          ${map(this.headers, (header) =>
            header !== this.targetEntity
              ? html`<option value="${header}">${header}</option>`
              : html``
          )}
        </select>
        <label id="label-target-entity">Target Entity</label>
        <select id="select-target" class="uk-select">
          ${map(this.headers, (header) =>
            header !== this.sourceEntity
              ? html`<option value="${header}">${header}</option>`
              : html``
          )}
        </select>
        <div class="uk-margin uk-grid-small uk-child-width-auto uk-grid">
          XXX Unknown entities
          <label
            ><input class="uk-radio" type="radio" name="radio2" checked />
            Ignore</label
          >
          <label
            ><input class="uk-radio" type="radio" name="radio2" /> Create</label
          >
          <label
            ><input class="uk-radio" type="radio" name="radio2" /> Custom</label
          >
        </div>
      </div> `;
  }
}
