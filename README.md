# Table by Halo-Digital

This package contains a table with the following features:

- Sorting

- Paging (including page size control)

- Each column search

- Global search

- Horizontal and vertical scrolling

- Customized buttons

- Clickable and expandable rows

- Checkbox for each row (optional)

Enjoy!


## Attributes

##### columns
<sub>Declare the table columns</sub>  
<sub>**Type:** {
    id: string;
    title: string;
    type: 'checkbox' | 'date' | 'number' | 'select' | 'text';
    options?: object[] | string[];
    optionsEndpoint?: string;
    min?: number;
    max?: number;
}[]</sub>
<sub>**Default:** []</sub>
<br />

##### rows
<sub>Declare the table rows</sub>  
<sub>**Type:** {[columnId: string]: any}[]</sub>  
<sub>**Default:** []</sub>
<br />

##### totalRows
<sub>Declare the rows amount (from all pages)</sub>  
<sub>**Type:** number</sub>  
<sub>**Default:** 0</sub>
<br />

##### buttons
<sub>Declare buttons and related actions at the top of the table</sub>  
<sub>**Type:** {
    id: string;
    caption: string | ((checkedRows: object[]) => string);
    disableMethod?: (checkedRows: object[]) => boolean;
}[]</sub>  
<sub>**Default:** []</sub>
<br />

##### rowMenuItems
<sub>Declare a menu column (by declaring the menu rows)</sub>  
<sub>**Type:** {
    id: string;
    caption: string;
}[]</sub>  
<sub>**Default:** []</sub>
<br />

##### expandRowsConfig
<sub>Declare an expandable row (the 'component' param is a component that extends 'HaloTableExpandedComponent')</sub>  
<sub>**Type:** {
    component: Type<HaloTableExpandedComponent>;
    fieldId: string;
}</sub>  
<sub>**Default:** null</sub>
<br />

##### generalFilter
<sub>Declare the general filter value</sub>  
<sub>**Type:** string</sub>  
<sub>**Default:** null</sub>
<br />

##### columnsFilters
<sub>Declare each column filter value</sub>  
<sub>**Type:** {[columnId: string]: any}</sub>  
<sub>**Default:** {}</sub>
<br />

##### sort
<sub>Declare the sort state</sub>  
<sub>**Type:** {
    columnId: string;
    direction: 'asc' | 'desc';
}</sub>  
<sub>**Default:** null</sub>
<br />

##### pageIndex
<sub>Declare the current page index (starting from 1)</sub>  
<sub>**Type:** number</sub>  
<sub>**Default:** 1</sub>
<br />

##### pageSize
<sub>Declare the maximum rows amount in each page</sub>  
<sub>**Type:** number</sub>  
<sub>**Default:** 20</sub>
<br />

##### currentRowIndex
<sub>Declare the current row index (starting from 0)</sub>  
<sub>**Type:** number</sub>  
<sub>**Default:** null</sub>
<br />

##### showGeneralFilter
<sub>Show / hide the general filter</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** true</sub>
<br />

##### showColumnsFilters
<sub>Show / hide the columns filters</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** true</sub>
<br />

##### showPaginator
<sub>Show / hide the paginator</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** true</sub>
<br />

##### showCheckboxes
<sub>Show / hide the checkboxes at the beginning of each row</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** false</sub>
<br />

##### showParamsInURL
<sub>Declare if the params state will appear in URL (page size will not appear in URL. param that equals to his default value will not apear in URL also)</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** true</sub>
<br />

##### isClickableRows
<sub>Declare if the rows are clickable</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** true</sub>
<br />

##### isSortableColumns
<sub>Declare if the rows are sortable</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** true</sub>
<br />

##### isLoadingRows
<sub>Declare the rows loading state</sub>  
<sub>**Type:** boolean</sub>  
<sub>**Default:** false</sub>
<br />


## Events

##### tableParamsChange
<sub>Triggers on params change (i.e: pageIndex, pageSize, generalFilter etc.)</sub>  
<sub>**Event Parameter Type:** HaloTableChangeEvent <i>(Declared below)</i></sub>
<br />

##### generalFilterChange
<sub>Triggers on general filter change</sub>  
<sub>**Event Parameter Type:** string</sub>
<br />

##### columnsFiltersChange
<sub>Triggers on each column filter change</sub>  
<sub>**Event Parameter Type:** {[columnId: string]: any}</sub>
<br />

##### sortChange
<sub>Triggers on each column sort change</sub>  
<sub>**Event Parameter Type:** {
    columnId: string;
    direction: 'asc' | 'desc';
}</sub>
<br />

##### pageIndexChange
<sub>Triggers on page index change (the user performed a paging)</sub>  
<sub>**Event Parameter Type:** number</sub>
<br />

##### pageSizeChange
<sub>Triggers on page size change</sub>  
<sub>**Event Parameter Type:** number</sub>
<br />

##### currentRowIndexChange
<sub>Triggers on current row index change (the user clicked on a row)</sub>  
<sub>**Event Parameter Type:** number</sub>
<br />

##### buttonClick
<sub>Triggers on each button click</sub>  
<sub>**Event Parameter Type:** HaloTableButtonEvent <i>(Declared below)</i></sub>
<br />

##### rowClick
<sub>Triggers on current row index change (the user clicked on a row)</sub>  
<sub>**Event Parameter Type:** {[columnId: string]: any}</sub>
<br />

##### rowMenuItemClick
<sub>Triggers on each row inside a menu click</sub>  
<sub>**Event Parameter Type:** {
    menuItemId: string;
    row: object;
    rowIndex: number;
}</sub>
<br />


## Few More Things

##### HaloTableChangeEvent Declaration
```
{
    value: any;
    type: 'init' | 'generalFilter' | 'columnsFilters' | 'sort' | 'pageIndex' | 'pageSize';
    allParams: {
        generalFilter: string;
        columnsFilters: {[columnId: string]: any};
        sort: {columnId: string; direction: 'asc' | 'desc'};
        pageIndex: number;
        pageSize: number;
    };
    allParamsAsString: {
        freetext?: string;
        search?: string;
        ordering?: string;
        page?: string;
        size?: string;
    };
}
```

##### HaloTableButtonEvent Declaration
```
{
    id: string;
    checkedRows: {[columnId: string]: any}[];
    allParams: {
        generalFilter: string;
        columnsFilters: {[columnId: string]: any};
        sort: {columnId: string; direction: 'asc' | 'desc'};
        pageIndex: number;
        pageSize: number;
    };
    allParamsAsString: {
        freetext?: string;
        search?: string;
        ordering?: string;
        page?: string;
        size?: string;
    };
}
```


## Example

```
<halo-table
    [columns]="columns"
    [rows]="rows"
    [totalRows]="100"
    [currentRowIndex]="3"
    [pageSize]="15"
    [isLoadingRows]="false"
    (tableParamsChange)="tableParamsChanged($event)"
    (buttonClick)="buttonClicked($event)"
    (rowClick)="rowClicked($event)">
</halo-table>

<halo-table
    [columns]="columns"
    [rows]="rows"
    [totalRows]="200"
    [showGeneralFilter]="false"
    [showParamsInURL]="false"
    [isClickableRows]="false"
    [isLoadingRows]="true"
    (tableParamsChange)="tableParamsChanged($event)"
    (rowMenuItemClick)="rowMenuItemClicked($event)">
</halo-table>
```
