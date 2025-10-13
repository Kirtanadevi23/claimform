import { Routes } from '@angular/router';
import { ClaimformComponent } from './components/claimform/claimform.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { ExpensereviewComponent } from './components/expensereview/expensereview.component';
import { InternationalformComponent } from './components/internationalform/internationalform.component';
import { Internationalform1Component } from './components/internationalform1/internationalform1.component';
import { InternationalreviewComponent } from './components/internationalreview/internationalreview.component';

export const routes: Routes = [
    {path:'',component:ClaimformComponent},
    {path:'expense',component:ExpenseComponent},
    {path:'expensereview',component:ExpensereviewComponent},
    {path:'international',component:InternationalformComponent},
    {path:'internationalform1',component:Internationalform1Component},
    {path:'internationalreview',component:InternationalreviewComponent}
]
