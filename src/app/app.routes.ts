import { Routes } from '@angular/router';
import { ClaimformComponent } from './components/claimform/claimform.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { ExpensereviewComponent } from './components/expensereview/expensereview.component';
import { InternationalformComponent } from './components/internationalform/internationalform.component';
import { Internationalform1Component } from './components/internationalform1/internationalform1.component';
import { InternationalreviewComponent } from './components/internationalreview/internationalreview.component';
import { DomesticformComponent } from './components/domesticform/domesticform.component';
import { Domesticform1Component } from './components/domesticform1/domesticform1.component';
import { DomesticreviewComponent } from './components/domesticreview/domesticreview.component';
import { LoginpageComponent } from './components/loginpage/loginpage.component';

export const routes: Routes = [
 { path: '', redirectTo: 'login', pathMatch: 'full' },  
 { path: 'login', component: LoginpageComponent },
 { path: 'home', component: ClaimformComponent },
 { path: 'expense', component: ExpenseComponent },
 { path: 'expensereview', component: ExpensereviewComponent },
 { path: 'international', component: InternationalformComponent },
 { path: 'internationalform1', component: Internationalform1Component },
 { path: 'internationalreview', component: InternationalreviewComponent },
 { path: 'domestic', component: DomesticformComponent },
 { path: 'domesticform1', component: Domesticform1Component },
 { path: 'domesticreview', component: DomesticreviewComponent }
];