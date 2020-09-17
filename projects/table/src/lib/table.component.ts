import { ApplicationRef, Component, ComponentFactoryResolver, ElementRef, EmbeddedViewRef, EventEmitter, Inject, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment_ from 'moment-timezone';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HaloTableButton, HaloTableButtonEvent, HaloTableChangeEvent, HaloTableChangeEventType, HaloTableColumn, HaloTableColumnType, HaloTableExpandRowsConfig, HaloTableParams, HaloTableParamsAsString, HaloTableRowMenuEvent, HaloTableRowMenuItem, HaloTableSort, HaloTableTimezone } from './table';
import { HaloTableExpandedComponent } from './table.expanded.component';

const moment = moment_;


@Component({
    selector: 'halo-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})

export class HaloTableComponent implements OnInit, OnDestroy {

    columnsIds: string[];
    columnsFilterIds: string[];
    checkboxesState: boolean[];
    expandsState: boolean[];

    private subscriptions: {[key: string]: Subscription};
    private tableParamsChangeCalled: boolean;
    private notifyTableParamsChange: Subject<[HaloTableChangeEventType, any]> = new Subject<[HaloTableChangeEventType, any]>();

    private _columns: HaloTableColumn[];
    private _rows: object[];
    private _totalRows: number;
    private _buttons: HaloTableButton[];
    private _rowMenuItems: HaloTableRowMenuItem[];
    private _expandRowsConfig: HaloTableExpandRowsConfig;
    private _currentRowIndex: number;
    private _generalFilter: string;
    private _columnsFilters: object;
    private _sort: HaloTableSort;
    private _pageIndex: number;
    private _pageSize: number;
    private _showGeneralFilter: boolean;
    private _showColumnsFilters: boolean;
    private _showPaginator: boolean;
    private _showCheckboxes: boolean;
    private _showParamsInURL: boolean;
    private _isClickableRows: boolean;
    private _isSortableColumns: boolean;
    private _isLoadingRows: boolean;

    @ViewChild('empty', {static: true}) emptyElement: ElementRef;
    @ViewChild('loading', {static: true}) loadingElement: ElementRef;
    @ViewChild('headers', {static: true}) headersElement: ElementRef;
    @ViewChild('content', {static: true}) contentElement: ElementRef;
    @ViewChild('paginator', {static: true}) paginator: MatPaginator;

    @Output() tableParamsChange: EventEmitter<HaloTableChangeEvent> = new EventEmitter<HaloTableChangeEvent>();
    @Output() generalFilterChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() columnsFiltersChange: EventEmitter<object> = new EventEmitter<object>();
    @Output() sortChange: EventEmitter<HaloTableSort> = new EventEmitter<HaloTableSort>();
    @Output() pageIndexChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() pageSizeChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() currentRowIndexChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() buttonClick: EventEmitter<HaloTableButtonEvent> = new EventEmitter<HaloTableButtonEvent>();
    @Output() rowClick: EventEmitter<object> = new EventEmitter<object>();
    @Output() rowMenuItemClick: EventEmitter<HaloTableRowMenuEvent> = new EventEmitter<HaloTableRowMenuEvent>();

    @Input()
    get columns(): HaloTableColumn[] {

        return Array.isArray(this._columns) ? this._columns : [];

    }
    set columns(columns: HaloTableColumn[]) {

        this._columns = columns;

        this.loadColumns();

    }

    @Input()
    get rows(): object[] {

        return Array.isArray(this._rows) ? this._rows : [];

    }
    set rows(rows: object[]) {

        this._rows = this.formatRows(rows);

        this.checkboxesState = this._rows.map(row => false);
        this.expandsState = this._rows.map(row => false);

    }

    @Input()
    get totalRows(): number {

        return this._totalRows || 0;

    }
    set totalRows(totalRows: number) {

        this._totalRows = totalRows;

    }

    @Input()
    get buttons(): HaloTableButton[] {

        return Array.isArray(this._buttons) ? this._buttons : [];

    }
    set buttons(buttons: HaloTableButton[]) {

        this._buttons = buttons;

    }

    @Input()
    get rowMenuItems(): HaloTableRowMenuItem[] {

        return Array.isArray(this._rowMenuItems) ? this._rowMenuItems : [];

    }
    set rowMenuItems(rowMenuItems: HaloTableRowMenuItem[]) {

        this._rowMenuItems = rowMenuItems;

        this.loadColumns();

    }

    @Input()
    get expandRowsConfig(): HaloTableExpandRowsConfig {

        return this._expandRowsConfig;

    }
    set expandRowsConfig(expandRowsConfig: HaloTableExpandRowsConfig) {

        this._expandRowsConfig = expandRowsConfig;

        this.loadColumns();

    }

    @Input()
    get generalFilter(): string {

        return this._generalFilter || null;

    }
    set generalFilter(generalFilter: string) {

        this._pageIndex = 1;
        this._generalFilter = generalFilter;

        this.pageIndexChange.emit(1);
        this.generalFilterChange.emit(this.generalFilter);

        this.notifyTableParamsChange.next(['generalFilter', this.generalFilter]);

    }

    @Input()
    get columnsFilters(): object {

        return this._columnsFilters || {};

    }
    set columnsFilters(columnsFilters: object) {

        this._pageIndex = 1;
        this._columnsFilters = columnsFilters || {};

        this.pageIndexChange.emit(1);
        this.columnsFiltersChange.emit(this.columnsFilters);

        this.notifyTableParamsChange.next(['columnsFilters', this.columnsFilters]);

    }

    @Input()
    get sort(): HaloTableSort {

        return this._sort || null;

    }
    set sort(sort: HaloTableSort) {

        this._pageIndex = 1;
        this._sort = sort;

        this.pageIndexChange.emit(1);
        this.sortChange.emit(this.sort);

        this.notifyTableParamsChange.next(['sort', this.sort]);

    }

    @Input()
    get pageIndex(): number {

        return !isNaN(+this._pageIndex) && this._pageIndex > 0 ? +this._pageIndex : 1;

    }
    set pageIndex(pageIndex: number) {

        this._pageIndex = pageIndex;

        this.pageIndexChange.emit(this.pageIndex);

        this.notifyTableParamsChange.next(['pageIndex', this.pageIndex]);

    }

    @Input()
    get pageSize(): number {

        return !isNaN(+this._pageSize) && this._pageSize > 0 ? +this._pageSize : 20;

    }
    set pageSize(pageSize: number) {

        this._pageIndex = 1;
        this._pageSize = pageSize;

        this.pageIndexChange.emit(1);
        this.pageSizeChange.emit(this.pageSize);

        this.notifyTableParamsChange.next(['pageSize', this.pageSize]);

    }

    @Input()
    get currentRowIndex(): number {

        return !isNaN(+this._currentRowIndex) && this._currentRowIndex >= 0 ? +this._currentRowIndex : null;

    }
    set currentRowIndex(currentRowIndex: number) {

        this._currentRowIndex = currentRowIndex;

        this.currentRowIndexChange.emit(this.currentRowIndex);

    }

    @Input()
    get showGeneralFilter(): boolean {

        return this.getBooleanValue(this._showGeneralFilter, true);

    }
    set showGeneralFilter(showGeneralFilter: boolean) {

        this._showGeneralFilter = showGeneralFilter;

    }

    @Input()
    get showColumnsFilters(): boolean {

        return this.getBooleanValue(this._showColumnsFilters, true);

    }
    set showColumnsFilters(showColumnsFilters: boolean) {

        this._showColumnsFilters = showColumnsFilters;

    }

    @Input()
    get showPaginator(): boolean {

        return this.getBooleanValue(this._showPaginator, true);

    }
    set showPaginator(showPaginator: boolean) {

        this._showPaginator = showPaginator;

    }

    @Input()
    get showCheckboxes(): boolean {

        return this.getBooleanValue(this._showCheckboxes, false);

    }
    set showCheckboxes(showCheckboxes: boolean) {

        this._showCheckboxes = showCheckboxes;

        this.loadColumns();

    }

    @Input()
    get showParamsInURL(): boolean {

        return this.getBooleanValue(this._showParamsInURL, true);

    }
    set showParamsInURL(showParamsInURL: boolean) {

        this._showParamsInURL = showParamsInURL;

    }

    @Input()
    get isClickableRows(): boolean {

        return this.getBooleanValue(this._isClickableRows, true);

    }
    set isClickableRows(isClickableRows: boolean) {

        this._isClickableRows = isClickableRows;

    }

    @Input()
    get isSortableColumns(): boolean {

        return this.getBooleanValue(this._isSortableColumns, true);


    }
    set isSortableColumns(isSortableColumns: boolean) {

        this._isSortableColumns = isSortableColumns;

    }

    @Input()
    get isLoadingRows(): boolean {

        return this.getBooleanValue(this._isLoadingRows, false);

    }
    set isLoadingRows(isLoadingRows: boolean) {

        this._isLoadingRows = isLoadingRows;

    }

    get parentCheckboxState(): boolean {

        return this.checkboxesState.length && this.checkboxesState.every(checked => checked);

    }
    set parentCheckboxState(checked: boolean) {

        this.checkboxesState = this.checkboxesState.map(isChecked => checked);

    }

    get tableParams(): HaloTableParams {

        return {
            generalFilter: this.generalFilter,
            columnsFilters: this.columnsFilters,
            sort: this.sort,
            pageIndex: this.pageIndex,
            pageSize: this.pageSize
        };

    }

    get tableParamsAsString(): HaloTableParamsAsString {

        const tableParams = {};

        if (this.generalFilterAsString) {

            tableParams['freetext'] = this.generalFilterAsString;

        }

        if (this.columnsFiltersAsString) {

            tableParams['search'] = this.columnsFiltersAsString;

        }

        if (this.sortAsString) {

            tableParams['ordering'] = this.sortAsString;

        }

        if (this.pageIndexAsString) {

            tableParams['page'] = this.pageIndexAsString;

        }

        if (this.pageSizeAsString) {

            tableParams['size'] = this.pageSizeAsString;

        }

        return tableParams;

    }

    get generalFilterAsString(): string {

        return (this.generalFilter || '').trim() || null;

    }

    get columnsFiltersAsString(): string {

        let columnsFilters = '';

        Object.entries(this.columnsFilters).forEach(([filterKey, filterValue]) => {

            if (filterValue !== undefined && filterValue !== null) {

                const columnType = this.columns?.find(c => c.id === filterKey)?.type;

                if (columnType === HaloTableColumnType.Select) {

                    columnsFilters += filterKey + '=';

                    filterValue.forEach((phrase: string) => {
                        columnsFilters += phrase + '|';
                    });

                    if (columnsFilters.endsWith('|')) {
                        columnsFilters = columnsFilters.substring(0, columnsFilters.length - 1) + ',';
                    }

                } else if (columnType === HaloTableColumnType.Date) {

                    if (filterValue[0] || filterValue[0] === 0) {
                        columnsFilters += filterKey + '>' + filterValue[0] + ',';
                    }

                    if (filterValue[1] || filterValue[1] === 0) {
                        columnsFilters += filterKey + '<' + filterValue[1] + ',';
                    }

                } else if ((filterValue + '').trim()) {

                    columnsFilters += filterKey + '=' + (encodeURIComponent(filterValue) + '').trim() + ',';

                }
            }

        });

        if (columnsFilters.endsWith(',')) {

            columnsFilters = columnsFilters.substring(0, columnsFilters.length - 1);

        }

        return columnsFilters || null;

    }

    get sortAsString(): string {

        if (!this.sort) {

            return null;

        }

        return (this.sort.direction === 'desc' ? '-' : '') + this.sort.columnId;

    }

    get pageIndexAsString(): string {

        if (this.pageIndex === 1) {

            return null;

        }

        return this.pageIndex + '';

    }

    get pageSizeAsString(): string {

        return this.pageSize + '';

    }

    get dateFormat(): string {

        return this.haloTableDateFormat || 'DD/MM/YYYY HH:mm:ss';

    }

    get timezone(): HaloTableTimezone {

        return this.haloTableTimezone || 'UTC';

    }

    get checkedRows(): object[] {

        return this.rows?.filter((row, index) => this.checkboxesState?.[index]);

    }

    get isFullState(): boolean {

        return !this.isLoadingRows && this.totalRows > 0;

    }

    get isEmptyState(): boolean {

        return !this.isLoadingRows && !this.rows.length;

    }

    get isLoadingState(): boolean {

        return this.isLoadingRows;

    }

    get showActions(): boolean {

        return this.showGeneralFilter || this.buttons.length > 0;

    }

    get showRowMenu(): boolean {

        return Array.isArray(this.rowMenuItems) && this.rowMenuItems.length > 0;

    }

    get showExpands(): boolean {

        return !!this.expandRowsConfig?.component && !!this.expandRowsConfig?.fieldId;

    }

    constructor(private appRef: ApplicationRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private injector: Injector,
                private route: ActivatedRoute,
                private router: Router,
                @Inject('haloTableDateFormat') private haloTableDateFormat: string,
                @Inject('haloTableTimezone') private haloTableTimezone: HaloTableTimezone) {

        this.subscriptions = {};
        this._pageIndex = 1;
        this._columnsFilters = {};

        this.notifyTableParamsChange
        .pipe(debounceTime(700))
        .subscribe(([changeId, changeValue]) => {

            this.tableParamsChangeCalled = true;

            this.tableParamsChange.emit({
                type: changeId,
                value: changeValue,
                allParams: this.tableParams,
                allParamsAsString: this.tableParamsAsString
            });

        });

    }

    ngOnInit(): void {

        this.alignColumns();

        if (this.paginator) {

            this.paginator._intl.previousPageLabel = '';
            this.paginator._intl.nextPageLabel = '';
            this.paginator._intl.firstPageLabel = '';
            this.paginator._intl.lastPageLabel = '';

        }

        if (this.showParamsInURL) {

            this.subscriptions['routeQueryParams'] = this.route.queryParams.subscribe(queryParams => {

                if (queryParams['freetext']) {

                    this.generalFilter = queryParams['freetext'];

                }

                if (queryParams['search']) {

                    this.columnsFilters = this.formatColumnsFilters(queryParams['search']);

                }

                if (queryParams['ordering']) {

                    this.sort = this.formatSort(queryParams['ordering']);

                }

                if (queryParams['page']) {

                    this.pageIndex = this.formatPageIndex(queryParams['page']);

                }

            });

        }

        if (!this.tableParamsChangeCalled) {

            this.notifyTableParamsChange.next(['init', null]);

        }

    }

    ngOnDestroy(): void {

        Object.values(this.subscriptions).forEach(subscription => subscription.unsubscribe());

    }

    buttonClicked(id: string): void {

        this.buttonClick.emit({id, checkedRows: this.checkedRows, allParams: this.tableParams, allParamsAsString: this.tableParamsAsString});

    }

    generalFilterChanged(): void {

        if (this.showParamsInURL) {

            this.router.navigate([], {queryParamsHandling: 'merge', queryParams: {freetext: this.generalFilterAsString, page: this.pageIndexAsString}});

        }

    }

    columnsFiltersChanged(): void {

        this.columnsFilters = Object.assign({}, this.columnsFilters);

        if (this.showParamsInURL) {

            this.router.navigate([], {queryParamsHandling: 'merge', queryParams: {search: this.columnsFiltersAsString, page: this.pageIndexAsString}});

        }

    }

    sortChanged(sort: {active: string; direction: 'asc' | 'desc'}): void {

        if (sort.direction) {

            this.sort = {columnId: sort.active, direction: sort.direction};

        } else {

            this.sort = null;

        }

        if (this.showParamsInURL) {

            this.router.navigate([], {queryParamsHandling: 'merge', queryParams: {ordering: this.sortAsString, page: this.pageIndexAsString}});

        }

    }

    pagingChanged(pageIndex: number, pageSize: number): void {

        if (this.pageIndex !== pageIndex + 1) {

            this.pageIndex = pageIndex + 1;

        }

        if (this.pageSize !== pageSize) {

            this.pageSize = pageSize;

        }

        if (this.showParamsInURL) {

            this.router.navigate([], {queryParamsHandling: 'merge', queryParams: {page: this.pageIndexAsString}});

        }

    }

    expandChanged(rowIndex: number): void {

        this.expandsState[rowIndex] = !this.expandsState[rowIndex];

        setTimeout(() => {

            if (this.expandsState[rowIndex]) {

                this.loadExpandedRow(rowIndex);

            }

        }, 0);

    }

    rowClicked(row: object, index: number): void {

        if (this.isClickableRows) {

            this.currentRowIndex = index;

            this.rowClick.emit(row);

        }

    }

    rowMenuAction(menuItemId: string, row: object, rowIndex: number): void {

        this.rowMenuItemClick.emit({menuItemId, row, rowIndex});

    }

    scroll(event: object): void {

        this.headersElement.nativeElement.querySelector('table').style.marginLeft = (event['scrollLeft'] * (-1)) + 'px';

        if (this.emptyElement.nativeElement) {

            this.emptyElement.nativeElement.style.marginLeft = event['scrollLeft'] + 'px';

        }

        if (this.loadingElement.nativeElement) {

            this.loadingElement.nativeElement.style.marginLeft = event['scrollLeft'] + 'px';
            this.loadingElement.nativeElement.style.marginTop = event['scrollTop'] + 'px';

        }

    }

    getButtonCaption(button: HaloTableButton): string {

        if (typeof button.caption === 'function') {

            return button.caption(this.checkedRows);

        }

        return button.caption;

    }

    getColumnTitleTooltip(column: HaloTableColumn): string {

        const columnTitleElement = document.getElementById('halo-table-title-' + column.id).getElementsByClassName('mat-sort-header-content')[0];

        if (columnTitleElement?.['offsetWidth'] < columnTitleElement?.['scrollWidth']) {

            return column.title;

        }

        return null;

    }

    isCheckboxColumn(column: HaloTableColumn): boolean {

        return column.id === 'checkbox';

    }

    isExpandColumn(column: HaloTableColumn): boolean {

        return column.id === 'expand';

    }

    isMenuColumn(column: HaloTableColumn): boolean {

        return column.id === 'menu';

    }

    isRegularColumn(column: HaloTableColumn): boolean {

        return !this.isCheckboxColumn(column) && !this.isExpandColumn(column) && !this.isMenuColumn(column);

    }

    isCurrentRow(rowIndex: number): boolean {

        return rowIndex === this.currentRowIndex;

    }

    isButtonDisabled(button: HaloTableButton): boolean {

        if (button.disableMethod) {

            return button.disableMethod(this.checkedRows);

        }

        return false;

    }

    private loadColumns(): void {

        if (!this.columns?.length) { return; }

        const checkboxesColIndex = this.columns.findIndex(column => column.id === 'checkbox');
        const expandsColIndex = this.columns.findIndex(column => column.id === 'expand');
        const menuColIndex = this.columns.findIndex(column => column.id === 'menu');

        if (this.showCheckboxes && checkboxesColIndex === -1) {

            this.columns.unshift({
                id: 'checkbox',
                title: null,
                type: null
            });

        } else if (!this.showCheckboxes && checkboxesColIndex > -1) {

            this.columns.splice(checkboxesColIndex, 1);

        }

        if (this.showExpands && expandsColIndex === -1) {

            this.columns.unshift({
                id: 'expand',
                title: null,
                type: null
            });

        } else if (!this.showExpands && expandsColIndex > -1) {

            this.columns.splice(expandsColIndex, 1);

        }

        if (this.showRowMenu && menuColIndex === -1) {

            this.columns.push({
                id: 'menu',
                title: null,
                type: null
            });

        } else if (!this.showRowMenu && menuColIndex > -1) {

            this.columns.splice(menuColIndex, 1);

        }

        this.columnsIds = this.columns.map(column => column.id);
        this.columnsFilterIds = this.columns.map(column => column.id + '-filter');

        this.alignColumns();

    }

    private loadExpandedRow(rowIndex: number): void {

        const factory = this.componentFactoryResolver.resolveComponentFactory<HaloTableExpandedComponent>(this.expandRowsConfig.component);
        const ref = factory.create(this.injector);
        const element = (ref.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

        ref.instance.content = this.rows[rowIndex][this.expandRowsConfig.fieldId];

        this.appRef.attachView(ref.hostView);
        document.getElementById('expanded-row-' + rowIndex).appendChild(element);

    }

    private formatRows(rows: object[]): object[] {

        if (!Array.isArray(rows)) {

            return [];

        }

        return rows.map(row => {

            Object.keys(row).forEach(key => {

                const columnType = this.columns.find(c => c.id === key)?.type;
                const value = row[key];

                if (columnType === HaloTableColumnType.Checkbox) {

                    row[key] = value ? 'True' : 'False';

                } else if (value && columnType === HaloTableColumnType.Date && typeof value === 'number') {

                    row[key] = moment(value).tz(this.timezone).format(this.dateFormat);

                }

            });

            return row;

        });

    }

    private formatColumnsFilters(columnsFilters: string): object {

        const output = {};
        const filters = columnsFilters?.split(',') || [];

        filters.forEach(filter => {

            let filterKey: string;
            let filterValue: any;

            if (filter.indexOf('=') > -1) {
                [filterKey, filterValue] = filter.split('=');
            } else if (filter.indexOf('>') > -1) {
                [filterKey, filterValue] = filter.split('>');
            } else if (filter.indexOf('<') > -1) {
                [filterKey, filterValue] = filter.split('<');
            }

            const columnType = this.columns?.find(c => c.id === filterKey)?.type;

            if (columnType === HaloTableColumnType.Select) {

                output[filterKey] = filterValue.split('|');

                output[filterKey] = output[filterKey].map((value: any) => isNaN(value) ? value : parseInt(value, 10));

            } else if (columnType === HaloTableColumnType.Date) {

                if (!output[filterKey]) {
                    output[filterKey] = [null, null];
                }

                if (filter.indexOf('=') > -1) {

                    output[filterKey][0] = parseInt(filterValue, 10);
                    output[filterKey][1] = parseInt(filterValue, 10);

                } else if (filter.indexOf('>') > -1) {

                    output[filterKey][0] = parseInt(filterValue, 10);

                } else if (filter.indexOf('<') > -1) {

                    output[filterKey][1] = parseInt(filterValue, 10);

                }

            } else if (columnType === HaloTableColumnType.Number) {

                output[filterKey] = parseFloat(filterValue);

            } else if (columnType === HaloTableColumnType.Text) {

                output[filterKey] = (decodeURIComponent(filterValue) + '').trim();

            } else {

                output[filterKey] = filterValue;

            }

        });

        return output;

    }

    private formatSort(sort: string): HaloTableSort {

        if (sort) {

            let columnId: string;
            let direction: 'asc' | 'desc';

            if (sort.startsWith('-')) {

                columnId = sort.substring(1);
                direction = 'desc';

            } else {

                columnId = sort;
                direction = 'asc';

            }

            return {columnId, direction};

        }

        return null;

    }

    private formatPageIndex(pageIndex: string): number {

        return (!isNaN(+pageIndex) && +pageIndex > 0) ? +pageIndex : 1;

    }

    private alignColumns(): void {

        setTimeout(() => {

            const headers: string = this.headersElement.nativeElement.querySelector('thead').innerHTML;
            let content: string = this.contentElement.nativeElement.querySelector('tbody').innerHTML;

            this.rows.forEach(row => {

                const start = content.indexOf('<halo-input');
                const end = content.indexOf('</halo-input>') + 13;

                if (start > -1) {
                    content = content.replace(content.substring(start, end), '');
                }

            });

            this.headersElement.nativeElement.querySelector('tbody').innerHTML = content;
            this.contentElement.nativeElement.querySelector('thead').innerHTML = headers;

        }, 200);

    }

    private getBooleanValue(value: boolean, defaultValue: boolean): boolean {

        return value !== !defaultValue ? defaultValue : !defaultValue;

    }

}
