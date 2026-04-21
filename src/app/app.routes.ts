import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { GeneralExpenseEntryComponent } from './components/general-expense-entry/general-expense-entry.component';
import { GeneralExpenseReviewComponent } from './components/general-expense-review/general-expense-review.component';
import { IntlTravelDetailsComponent } from './components/intl-travel-details/intl-travel-details.component';
import { IntlExpenseEntryComponent } from './components/intl-expense-entry/intl-expense-entry.component';
import { IntlExpenseReviewComponent } from './components/intl-expense-review/intl-expense-review.component';
import { DomesticTravelDetailsComponent } from './components/domestic-travel-details/domestic-travel-details.component';
import { DomesticExpenseEntryComponent } from './components/domestic-expense-entry/domestic-expense-entry.component';
import { DomesticExpenseReviewComponent } from './components/domestic-expense-review/domestic-expense-review.component';
import { LoginPageComponent } from './components/login-page/login-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginPageComponent },
    { path: 'home-page', component: HomePageComponent },
    { path: 'general-expense-entry/:claimId', component: GeneralExpenseEntryComponent },
    { path: 'general-expense-review/:claimId', component: GeneralExpenseReviewComponent },
    { path: 'intl-travel-details/:claimId', component: IntlTravelDetailsComponent },
    { path: 'intl-expense-entry/:claimId', component: IntlExpenseEntryComponent },
    { path: 'intl-expense-review/:claimId', component: IntlExpenseReviewComponent },
    { path: 'domestic-travel-details/:claimId', component: DomesticTravelDetailsComponent },
    { path: 'domestic-expense-entry/:claimId', component: DomesticExpenseEntryComponent },
    { path: 'domestic-expense-review/:claimId', component: DomesticExpenseReviewComponent }
];
