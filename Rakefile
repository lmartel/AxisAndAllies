require 'net/http'

desc "This task is called by the Heroku scheduler add-on to keep the app awake"
task :ping_self do
   uri = URI.parse('http://game.lpm.io/')
   Net::HTTP.get(uri)
end
