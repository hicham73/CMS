using EY.CMS.Plugins.Base;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EY.CMS.Plugins.Case
{
    internal class PostCase: BasePlugin
    {
        public PostCase(string unsecureConfig, string secureConfig)
            : base(unsecureConfig, secureConfig) { }

        protected override void ExecutePlugin(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {
            var messageName = context.MessageName;

            if (messageName == "Update")
            {
                // handle the update operations
            }
            else if (messageName == "Create")
            {
                // handle the create operations
            }
        }

    }
}
