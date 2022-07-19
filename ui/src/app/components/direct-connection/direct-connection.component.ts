import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import IDbConfig from 'src/app/model/db-config'
import { FetchService } from 'src/app/services/fetch/fetch.service'
import { DataService } from 'src/app/services/data/data.service'
import { LoaderService } from '../../services/loader/loader.service'
import { InputType, StorageKeys } from 'src/app/app.constants'
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service'
import { extractSourceDbName } from 'src/app/utils/utils'
import { ClickEventService } from 'src/app/services/click-event/click-event.service'

@Component({
  selector: 'app-direct-connection',
  templateUrl: './direct-connection.component.html',
  styleUrls: ['./direct-connection.component.scss'],
})
export class DirectConnectionComponent implements OnInit {
  connectForm = new FormGroup({
    dbEngine: new FormControl('', [Validators.required]),
    hostName: new FormControl('', [Validators.required]),
    port: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    userName: new FormControl('', [Validators.required]),
    password: new FormControl(''),
    dbName: new FormControl('', [Validators.required]),
  })

  dbEngineList = [
    { value: 'mysql', displayName: 'MYSQL' },
    { value: 'sqlserver', displayName: 'SQL Server' },
    { value: 'oracle', displayName: 'ORACLE' },
    { value: 'postgres', displayName: 'PostgreSQL' },
  ]

  constructor(
    private router: Router,
    private fetch: FetchService,
    private data: DataService,
    private loader: LoaderService,
    private snackbarService: SnackbarService,
    private clickEvent: ClickEventService
  ) {}

  ngOnInit(): void {}

  connectToDb() {
    this.clickEvent.openDatabaseLoader('direct', this.connectForm.value.dbName)
    window.scroll(0, 0)
    this.data.resetStore()
    const { dbEngine, hostName, port, userName, password, dbName } = this.connectForm.value
    const config: IDbConfig = { dbEngine, hostName, port, userName, password, dbName }
    this.fetch.connectTodb(config).subscribe({
      next: () => {
        this.data.getSchemaConversionFromDb()
        this.data.conv.subscribe((res) => {
          localStorage.setItem(
            StorageKeys.Config,
            JSON.stringify({ dbEngine, hostName, port, userName, password, dbName })
          )
          localStorage.setItem(StorageKeys.Type, InputType.DirectConnect)
          localStorage.setItem(StorageKeys.SourceDbName, extractSourceDbName(dbEngine))
          this.clickEvent.closeDatabaseLoader()
          this.router.navigate(['/workspace'])
        })
      },
      error: (e) => {
        this.snackbarService.openSnackBar(e.error, 'Close')
        this.clickEvent.closeDatabaseLoader()
      },
    })
  }
}