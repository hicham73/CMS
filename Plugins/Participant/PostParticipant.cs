using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using EY.CMS.Plugins.Base;

namespace EY.CMS.Plugins
{
    public class PostParticipant : BasePlugin
    {
        public PostParticipant(string unsecureConfig, string secureConfig)
            : base(unsecureConfig, secureConfig) { }

        protected override void ExecutePlugin(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {
            tracingService.Trace("ParticipantPostUpdate: Starting execution");

            // Validate context
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity target)
            {
                if (target.LogicalName != "pr_participant")
                {
                    tracingService.Trace("ParticipantPostUpdate: Not an ActivityParty entity, exiting");
                    return;
                }

                // Get pre-image for comparison
                Entity preImage = null;
                if (context.PreEntityImages.Contains("PreImage"))
                {
                    preImage = context.PreEntityImages["PreImage"];
                }

                // Get post-image for full entity data
                Entity postImage = null;
                if (context.PostEntityImages.Contains("PostImage"))
                {
                    postImage = context.PostEntityImages["PostImage"];
                }

                // Process the participant update
            }
            else
            {
                tracingService.Trace("ParticipantPostUpdate: No valid target entity found");
            }
        }
    }

}