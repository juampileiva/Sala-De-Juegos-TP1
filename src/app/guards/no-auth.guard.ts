import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { supabase } from '../services/supabase';

export const noAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const { data } = await supabase.auth.getSession();

  if (data.session && data.session.user) {
    return router.createUrlTree(['/']);
  }

  return true;
};