require 'nutella_lib'


# Parse command line arguments
broker, app_id, run_id = nutella.app.parse_args ARGV
# Extract the component_id
component_id = nutella.extract_component_id
# Initialize nutella
nutella.app.init(broker, app_id, component_id)
# (Optional) Set the resourceId
nutella.app.set_resource_id 'my_resource_id'



currentRun = nutella.app.persist.get_mongo_object_store('currentRun')

# currentRun['class'] = 'default'
if currentRun.empty?
    currentRun['class'] = 'default'
end

nutella.app.net.handle_requests_on_run('default','get_current_run', lambda do |request, from|
                                                reply = currentRun ['class']
                                                reply
                                               end)

nutella.app.net.handle_requests_on_run('6MT','get_current_run', lambda do |request, from|
                                                reply = currentRun ['class']
                                                reply
                                               end)

nutella.app.net.handle_requests_on_run('6ADF','get_current_run', lambda do |request, from|
                                                reply = currentRun ['class']
                                                reply
                                               end)

nutella.app.net.handle_requests_on_run('6BM','get_current_run', lambda do |request, from|
                                                reply = currentRun ['class']
                                                reply
                                               end)

nutella.app.net.handle_requests_on_run('guest','get_current_run', lambda do |request, from|
                                                reply = currentRun ['class']
                                                reply
                                               end)


nutella.app.net.subscribe_to_run('default','set_current_run', lambda do |request, from|
                                                currentRun ['class'] = request
                                               end)

nutella.app.net.subscribe_to_run('6MT','set_current_run', lambda do |request, from|
                                                currentRun ['class'] = request
                                               end)

nutella.app.net.subscribe_to_run('6ADF','set_current_run', lambda do |request, from|
                                                currentRun ['class'] = request
                                               end)

nutella.app.net.subscribe_to_run('6BM','set_current_run', lambda do |request, from|
                                                currentRun ['class'] = request
                                               end)

nutella.app.net.subscribe_to_run('guest','set_current_run', lambda do |request, from|
                                                currentRun ['class'] = request
                                               end)

nutella.app.net.listen
