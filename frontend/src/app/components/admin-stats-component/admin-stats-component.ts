import { Component, inject, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { AdminService } from '../../services/admin-service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin-stats-component',
  standalone: true,   // standalone component!
  imports: [BaseChartDirective],
  templateUrl: './admin-stats-component.html',
  styleUrl: './admin-stats-component.css',
})
export class AdminStatsComponent implements OnInit {
  private adminService = inject(AdminService);

  // bar chart for printer stats
  public barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public barChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, plugins: { legend: { display: false } } };

  // pie chart for product stats
  public pieChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = { responsive: true };

  ngOnInit(): void {
      this.loadStats();
  }

  loadStats() {
    const chartColors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#8AC926',
      '#1982C4',
      '#F15BB5',
      '#00BBF9'
    ];

    this.adminService.getTopPrinters().subscribe(res => {
      this.barChartData = {
        labels: res.map(r => r.printerName),
        datasets: [{ data: res.map(r => r.totalRevenue), label: 'Revenue (RSD)', backgroundColor: chartColors }]
      };
    });

    this.adminService.getTopProducts().subscribe(res => {
      this.pieChartData = {
        labels: res.map(r => r.productName),
        datasets: [{ data: res.map(r => r.totalQuantity), label: 'Pieces sold', backgroundColor: chartColors }]
      };
    });
  }
}
