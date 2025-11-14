/**
 * Route tree for TanStack Router
 * This file is generated/maintained manually
 */

import { Route as RootRoute } from './routes/__root';
import { Route as IndexRoute } from './routes/index';
import { Route as CardDetailRoute } from './routes/cards.$cardId';

// Create the route tree
export const routeTree = RootRoute.addChildren([IndexRoute, CardDetailRoute]);
