import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendPageService } from 'src/services/backendPage.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent implements OnInit {
  page: any;
  constructor(
    private route: ActivatedRoute,
    private pageService: BackendPageService
  ) {}

  async ngOnInit() {
    this.page = await this.pageService.getCurrentPage();
    this.route.params.subscribe((params) => {
      if ('id' in params) {
        const id = params['id'];
        console.log(`id = ${id}`);
      }
    });
  }
}
