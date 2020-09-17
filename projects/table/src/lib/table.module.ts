import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { HaloInputModule } from '@halodigital/input';
import { HaloLoadingModule } from '@halodigital/loading-animation';
import { HaloTooltipModule } from '@halodigital/tooltip';
import { HaloTableTimezone } from './table';
import { HaloTableComponent } from './table.component';
import { HaloTableExpandedComponent } from './table.expanded.component';


@NgModule({
    declarations: [
        HaloTableComponent,
        HaloTableExpandedComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HaloInputModule,
        HaloLoadingModule,
        HaloTooltipModule,
        MatButtonModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule
    ],
    exports: [
        HaloTableComponent,
        HaloTableExpandedComponent
    ]
})

export class HaloTableModule {

    static forRoot(dateFormat?: string, timezone?: HaloTableTimezone): ModuleWithProviders<HaloTableModule> {

        return {
            ngModule: HaloTableModule,
            providers: [
                {provide: 'haloTableDateFormat', useValue: dateFormat},
                {provide: 'haloTableTimezone', useValue: timezone}
            ]
        };

    }

}
