import type { BooleanLicenseFeature } from '@expert-dollop/n8n-constants';
import { Container } from '@expert-dollop/n8n-di';

import { ControllerRegistryMetadata } from './controller-registry-metadata';
import type { Controller } from './types';

export const Licensed =
  (licenseFeature: BooleanLicenseFeature): MethodDecorator =>
  (target, handlerName) => {
    const routeMetadata = Container.get(ControllerRegistryMetadata).getRouteMetadata(
      target.constructor as Controller,
      String(handlerName),
    );
    routeMetadata.licenseFeature = licenseFeature;
  };
