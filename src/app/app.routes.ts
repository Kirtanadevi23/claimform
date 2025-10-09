import { Routes } from '@angular/router';
import { ClaimformComponent } from './components/claimform/claimform.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { ExpensereviewComponent } from './components/expensereview/expensereview.component';

export const routes: Routes = [
    {path:'',component:ClaimformComponent},
    {path:'expense',component:ExpenseComponent},
    {path:'expensereview',component:ExpensereviewComponent}
];
