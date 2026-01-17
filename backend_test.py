import requests
import sys
from datetime import datetime

class MapYourFriendsAPITester:
    def __init__(self, base_url="https://4cea9e88-03fa-4c67-8b2c-1a33b29e9e56.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "test_session_1768641236368"  # From MongoDB setup
        self.test_user_id = "test-user-1768641236368"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add auth header if session token exists
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        # Add any additional headers
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {str(response_data)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                self.failed_tests.append({
                    'test': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:300]
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_auth_me(self):
        """Test current user endpoint"""
        return self.run_test("Get Current User", "GET", "api/auth/me", 200)

    def test_friends_list(self):
        """Test friends list endpoint"""
        return self.run_test("Get Friends List", "GET", "api/friends", 200)

    def test_friends_map(self):
        """Test friends map data endpoint"""
        return self.run_test("Get Friends Map Data", "GET", "api/friends/map", 200)

    def test_meetups_list(self):
        """Test meetups list endpoint"""
        return self.run_test("Get Meetups List", "GET", "api/meetups", 200)

    def test_inbox(self):
        """Test inbox endpoint"""
        return self.run_test("Get Inbox Messages", "GET", "api/messages/inbox", 200)

    def test_search_users(self):
        """Test user search endpoint"""
        return self.run_test("Search Users", "GET", "api/search/users?q=test", 200)

    def test_profile_update(self):
        """Test profile update endpoint"""
        update_data = {
            "bio": "Updated test bio",
            "active_city": "Munich, Germany",
            "active_city_lat": 48.1351,
            "active_city_lng": 11.5820,
            "availability": ["Advice", "Coffee"]
        }
        return self.run_test("Update Profile", "PUT", "api/users/me", 200, update_data)

    def test_create_meetup(self):
        """Test meetup creation"""
        meetup_data = {
            "title": "Test Meetup",
            "city": "Berlin, Germany",
            "city_lat": 52.52,
            "city_lng": 13.405,
            "date": "2025-02-15",
            "description": "Test meetup description"
        }
        return self.run_test("Create Meetup", "POST", "api/meetups", 200, meetup_data)

    def test_friend_requests(self):
        """Test friend requests endpoint"""
        return self.run_test("Get Friend Requests", "GET", "api/friends/requests", 200)

def main():
    print("🚀 Starting Map Your Friends API Tests")
    print("=" * 50)
    
    # Setup
    tester = MapYourFriendsAPITester()
    
    # Run tests in order of importance
    print("\n📋 Running Core API Tests...")
    
    # Health check first
    tester.test_health()
    
    # Auth tests
    tester.test_auth_me()
    
    # Core functionality tests
    tester.test_friends_list()
    tester.test_friends_map()
    tester.test_meetups_list()
    tester.test_inbox()
    tester.test_search_users()
    tester.test_friend_requests()
    
    # CRUD operations
    tester.test_profile_update()
    tester.test_create_meetup()

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"  - {failure['test']}: {failure.get('error', f\"Expected {failure.get('expected')}, got {failure.get('actual')}\"")}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())