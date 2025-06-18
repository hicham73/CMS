using EY.WorkforceAccelerator.Plugins;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EY.CMS.Plugins.Case
{
    internal class PreCase : PluginBase
    {
        public PreCase(string unsecure, string secure) : base(typeof(PreCase))
        {

            // TODO: Implement your custom configuration handling.
        }


        protected override void ExecuteCdsPlugin(ILocalPluginContext localContext)
        {
            if (localContext == null)
                throw new InvalidPluginExecutionException(nameof(localContext));
            ITracingService tracingService = localContext.TracingService;
            IPluginExecutionContext context = (IPluginExecutionContext)localContext.PluginExecutionContext;
            IOrganizationService service = localContext.CurrentUserService;

            if (context.MessageName == "Update")
            {
                // handle the update operations
            }

        }

    }
}
