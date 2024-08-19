import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Ensure this path is correct

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // Provides HttpClient
    provideRouter(routes), // Provides routing if applicable
  ],
})
.catch(err => console.error(err));