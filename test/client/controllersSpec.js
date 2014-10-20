describe('controllers', function () {
    var scope, location, controller, window, cookieStore, $httpBackend;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('UserController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('UserController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.showDetail).toBeDefined();
        }));
    });

    describe('AdministrationController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('AdministrationController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('AboutController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('AboutController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('FeedbackController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('FeedbackController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.delete).toBeDefined();
        }));

        it('should hold existing feedback', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{comment: 'a'},{comment: 'b'}]});

            $httpBackend.flush();

            expect(scope.feedbacks.length).toBe(2);
            expect(scope.feedbacks[0].comment).toBeDefined();
            expect(scope.feedbacks[1].comment).toBeDefined();
        }));

        it('should add an image to each feedback', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{}]});

            $httpBackend.flush();

            expect(scope.feedbacks[0].image).toBeDefined();
        }));

        xit('should consider each feedback comment as trusted HTML', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{comment: '<script>'}]});

            $httpBackend.flush();

            expect(scope.feedbacks[0].comment).toEqual( { $$unwrapTrustedValue : Function });
        }));

        it('should hold nothing when no feedback exists', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: {}});

            $httpBackend.flush();

            expect(scope.feedbacks).toEqual({});
        }));

        it('should hold nothing on error from backend API', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(500);

            $httpBackend.flush();

            expect(scope.feedbacks).toBeUndefined();
        }));
    });

    describe('ContactController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ContactController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.save).toBeDefined();
        }));
    });

    describe('LoginController', function () {
        beforeEach(inject(function ($rootScope, $window, $location, $cookieStore, $controller) {
            scope = $rootScope.$new();
            location = $location;
            window = $window;
            cookieStore = $cookieStore;
            controller = $controller('LoginController', {
                '$scope': scope
            });
            scope.form = {$setPristine : function() {}};
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.login).toBeDefined();
        }));

        it('forwards to main page after successful login', inject(function ($controller) {
            $httpBackend.whenPOST('/rest/user/login').respond(200, {token: 'auth_token'});

            scope.login();
            $httpBackend.flush();

            expect(location.path()).toBe('/');
        }));

        it('sets the returned authentication token as session cookie', inject(function ($controller) {
            $httpBackend.whenPOST('/rest/user/login').respond(200, {token: 'auth_token'});

            scope.login();
            $httpBackend.flush();

            expect(cookieStore.get('token')).toBe('auth_token');
        }));

        it('puts the returned basket id into browser session storage', inject(function ($controller) {
            $httpBackend.whenPOST('/rest/user/login').respond(200, {bid: 4711});

            scope.login();
            $httpBackend.flush();

            expect(window.sessionStorage.bid).toBe('4711');
        }));

        it('removes authentication token and basket id on failed login attempt', inject(function ($controller) {
            $httpBackend.whenPOST('/rest/user/login').respond(401);

            scope.login();
            $httpBackend.flush();

            expect(cookieStore.get('token')).toBeUndefined;
            expect(window.sessionStorage.bid).toBeUndefined;
        }));

        it('returns error message from server to client on failed login attempt', inject(function ($controller) {
            $httpBackend.whenPOST('/rest/user/login').respond(401, 'error');

            scope.login();
            $httpBackend.flush();

            expect(scope.error).toBe('error');
        }));

    });

    describe('LogoutController', function () {
        beforeEach(inject(function ($rootScope, $controller, $window, $location, $cookieStore) {
            scope = $rootScope.$new();
            window = $window;
            location = $location;
            cookieStore = $cookieStore;
            controller = $controller('LogoutController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));

        it('should remove authentication token from cookies', inject(function ($controller) {
            expect(cookieStore.get('token')).toBeUndefined();
        }));

        it('should remove basket id from session storage', inject(function ($controller) {
            expect(window.sessionStorage.bid).toBeUndefined();
        }));

        it('should forward to main page', inject(function ($controller) {
            expect(location.path()).toBe('/');
        }));

    });

    describe('RegisterController', function () {
        beforeEach(inject(function ($rootScope, $controller, $location) {
            scope = $rootScope.$new();
            location = $location;
            controller = $controller('RegisterController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.save).toBeDefined();
        }));

        it('resets the registration form and redirects to login page after user registration', inject(function ($controller) {
            $httpBackend.whenPOST('/api/Users/').respond(200);

            scope.save();
            $httpBackend.flush();

            expect(scope.user).toEqual({});
            expect(location.path()).toBe('/login');
        }));

    });

    describe('SearchController', function () {
        beforeEach(inject(function ($rootScope, $location, $controller) {
            scope = $rootScope.$new();
            location = $location;
            controller = $controller('SearchController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.search).toBeDefined();
        }));

        it('forwards to search result with search query as URL parameter', inject(function ($controller) {
            scope.searchQuery = 'lemon juice';
            scope.search();
            expect(location.path()).toBe('/search');
            expect(location.search()).toEqual({q: 'lemon juice'});
        }));

        it('forwards to search result with empty search criteria if no search query is present', inject(function ($controller) {
            scope.searchQuery = undefined;
            scope.search();
            expect(location.path()).toBe('/search');
            expect(location.search()).toEqual({q: ''});
        }));

    });

    describe('SearchResultController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('SearchResultController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.showDetail).toBeDefined();
            expect(scope.addToBasket).toBeDefined();
        }));

    });

    describe('NavbarController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('NavbarController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('BasketController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('BasketController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.delete).toBeDefined();
            expect(scope.order).toBeDefined();
            expect(scope.inc).toBeDefined();
            expect(scope.dec).toBeDefined();
        }));
    });

    describe('ChallengeController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ChallengeController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('ChangePasswordController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ChangePasswordController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.changePassword).toBeDefined();
        }));
    });

    describe('ProductDetailsController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            var id;
            controller = $controller('ProductDetailsController', {
                '$scope': scope,
                'id': id
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('UserDetailsController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            var id;
            controller = $controller('UserDetailsController', {
                '$scope': scope,
                'id': id
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

});
