using Microsoft.Xrm.Sdk;
using System;

namespace EY.CMS.Plugins.Base
{
    public abstract class BasePlugin : IPlugin
    {
        protected string UnsecureConfig { get; }
        protected string SecureConfig { get; }

        protected BasePlugin(string unsecureConfig, string secureConfig)
        {
            UnsecureConfig = unsecureConfig ?? string.Empty;
            SecureConfig = secureConfig ?? string.Empty;
        }

        public void Execute(IServiceProvider serviceProvider)
        {
            // Validate input
            if (serviceProvider == null)
            {
                throw new ArgumentNullException(nameof(serviceProvider));
            }

            // Obtain the execution context, service factory, and tracing service
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            // Validate required services
            if (context == null)
            {
                throw new InvalidPluginExecutionException("Failed to retrieve plugin execution context");
            }

            if (serviceFactory == null)
            {
                throw new InvalidPluginExecutionException("Failed to retrieve organization service factory");
            }

            if (tracingService == null)
            {
                throw new InvalidPluginExecutionException("Failed to retrieve tracing service");
            }

            var service = serviceFactory.CreateOrganizationService(context.UserId);

            try
            {
                tracingService.Trace($"Entering {GetType().Name}.Execute()");
                tracingService.Trace($"Correlation Id: {context.CorrelationId}");
                tracingService.Trace($"Initiating User: {context.InitiatingUserId}");
                tracingService.Trace($"Primary Entity: {context.PrimaryEntityName}");
                tracingService.Trace($"Message: {context.MessageName}");
                tracingService.Trace($"Stage: {context.Stage}");
                tracingService.Trace($"Mode: {context.Mode}");

                ValidateExecutionContext(context, tracingService);

                ExecutePlugin(service, context, tracingService);

                tracingService.Trace($"Exiting {GetType().Name}.Execute()");
            }
            catch (InvalidPluginExecutionException)
            {
                throw;
            }
            catch (Exception ex)
            {
                tracingService.Trace($"Exception in {GetType().Name}: {ex.ToString()}");

                // Log the full exception details for debugging
                tracingService.Trace($"Exception Details:");
                tracingService.Trace($"Message: {ex.Message}");
                tracingService.Trace($"Stack Trace: {ex.StackTrace}");

                if (ex.InnerException != null)
                {
                    tracingService.Trace($"Inner Exception: {ex.InnerException.Message}");
                    tracingService.Trace($"Inner Stack Trace: {ex.InnerException.StackTrace}");
                }

                // Throw a user-friendly error message
                throw new InvalidPluginExecutionException($"An error occurred in {GetType().Name}: {ex.Message}", ex);
            }
        }

        protected abstract void ExecutePlugin(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService);

        protected virtual void ValidateExecutionContext(IPluginExecutionContext context, ITracingService tracingService)
        {
            if (context.Depth > 8)
            {
                tracingService.Trace($"Plugin depth exceeded maximum allowed depth. Current depth: {context.Depth}");
                throw new InvalidPluginExecutionException($"Plugin execution depth ({context.Depth}) exceeded maximum allowed depth to prevent infinite loops.");
            }

            if (context.Depth > 1)
            {
                tracingService.Trace($"Plugin executing at depth: {context.Depth}");
            }

            tracingService.Trace("Execution context validation completed successfully");
        }

        protected T GetAttributeValue<T>(Entity entity, string attributeName)
        {
            if (entity == null || string.IsNullOrEmpty(attributeName))
            {
                return default(T);
            }

            return entity.Contains(attributeName) ? entity.GetAttributeValue<T>(attributeName) : default(T);
        }


        protected bool ShouldExecute(IPluginExecutionContext context, string expectedEntityName, ITracingService tracingService)
        {
            if (string.IsNullOrEmpty(expectedEntityName))
            {
                tracingService.Trace("Expected entity name is null or empty");
                return false;
            }

            if (context.PrimaryEntityName != expectedEntityName)
            {
                tracingService.Trace($"Plugin registered for {expectedEntityName} but executed for {context.PrimaryEntityName}");
                return false;
            }

            return true;
        }

        protected Entity GetTargetEntity(IPluginExecutionContext context)
        {
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity entity)
            {
                return entity;
            }

            return null;
        }

        protected EntityReference GetTargetEntityReference(IPluginExecutionContext context)
        {
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is EntityReference entityRef)
            {
                return entityRef;
            }

            return null;
        }

        protected Entity GetPreImage(IPluginExecutionContext context, string imageName = "PreImage")
        {
            if (context.PreEntityImages.Contains(imageName))
            {
                return context.PreEntityImages[imageName];
            }

            return null;
        }

        protected Entity GetPostImage(IPluginExecutionContext context, string imageName = "PostImage")
        {
            if (context.PostEntityImages.Contains(imageName))
            {
                return context.PostEntityImages[imageName];
            }

            return null;
        }
    }
}