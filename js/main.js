"use strict";
var PER_PAGE = 10;

var gitUserWorker = {
    currentPage: 1,
    maxPages: 1,
    currentGitUser: '',

    _clear: function () {
        var me = this;

        $('#followersData').empty();
        $('#gitUserName').val('');
        $('#getUserFollowersCount').val('');
        $('#gitUserBox').val('');
        me.currentGitUser = '';
    },

    _showLoadingDialog: function () {
        var dialog = bootbox.dialog({
            message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Loading...</div>',
            closeButton: false
        });

        dialog.css({
            'margin-top': function () {
                var w = $(window).height();
                var b = $(".modal-dialog").height();
                var h = (w - b) / 2;
                return h + "px";
            }
        });
    },

    _hideLoadingDialog: function () {
        bootbox.hideAll();
    },

    _requestJSON: function (url, callback) {
        $.ajax({
            url: url,
            complete: function (xhr) {
                callback.call(null, xhr.responseJSON);
            }
        });
    },

    _doGetUserDataRequest: function (gitUser) {
        var me = this;

        me._showLoadingDialog();

        me._requestJSON("https://api.github.com/users/" + gitUser, function (resJson) {
            me._hideLoadingDialog();

            if (resJson.message == "Not Found") {
                $('#followersBtn').attr("disabled", false);
                $('#followersBtn').removeClass("disabled");

                bootbox.alert('Could not find ' + gitUser);
            } else {
                $('#gitUserName').val(resJson.name || resJson.login);
                $('#getUserFollowersCount').val(resJson.followers || 0);
                me._doGetFollowersRequest(gitUser);
            }
        });
    },

    _doGetFollowersRequest: function (gitUser, page) {
        var me = this;

        page = page || 1;

        me._showLoadingDialog();

        me._requestJSON("https://api.github.com/users/" + gitUser + "/followers?page=" + page + "&per_page=" + PER_PAGE, function (resJson) {
            me._hideLoadingDialog();

            if (!resJson || resJson.length === 0 || resJson.message == "Not Found") {
                $('#followersBtn').attr("disabled", false);
                $('#followersBtn').removeClass("disabled");
                $('#loadMoreBtn').attr("disabled", false);
                $('#loadMoreBtn').removeClass("disabled");

                bootbox.alert('Could not find followers for ' + gitUser);
            } else {
                if (resJson.length > 0) {
                    var followersCount = parseInt($('#getUserFollowersCount').val());
                    me.maxPages = Math.ceil(followersCount / PER_PAGE);

                    if (followersCount > PER_PAGE) $('#loadMoreBtn').show();
                    else $('#loadMoreBtn').hide();

                    if (me.currentPage < me.maxPages) {
                        me.currentPage++;
                    } else {
                        $('#loadMoreBtn').hide();
                    }

                    resJson.forEach(function (follower) {
                        var tdLogin = '<td>' + follower.login + '</td>';
                        var tdAvatar = '<td><img width=30 height=30 src="' + follower.avatar_url + '"></td>';

                        $("#followersTable").find('tbody').append('<tr>' + tdLogin + tdAvatar + '</tr>');
                    });

                    $('#followersBtn').attr("disabled", false);
                    $('#followersBtn').removeClass("disabled");
                    $('#loadMoreBtn').attr("disabled", false);
                    $('#loadMoreBtn').removeClass("disabled");
                }
            }
        });
    },

    getFollowers: function (gitUser) {
        var me = this;

        if (!gitUser || gitUser.trim() === '') {
            $('#followersBtn').attr("disabled", false);
            $('#followersBtn').removeClass("disabled");

            bootbox.alert('Git user not defined !');
        } else {
            me.currentGitUser = gitUser;
            me._doGetUserDataRequest(gitUser);
        }
    },

    initEvents: function () {
        var me = this;

        $('#clearBtn').off('click').click(function () {
            me._clear();
        });

        $('#loadMoreBtn').off('click').click(function () {
            $(this).attr("disabled", true);
            $(this).addClass('disabled');

            me._doGetFollowersRequest(me.currentGitUser, me.currentPage);
        });

        $('#followersBtn').off('click').click(function () {
            var gitUser = $('#gitUserBox').val();

            $(this).attr("disabled", true);
            $(this).addClass('disabled');

            me._clear();
            me.getFollowers(gitUser);
        });
    }
};
